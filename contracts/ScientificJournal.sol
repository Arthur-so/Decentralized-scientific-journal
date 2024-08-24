// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ScientificJournal {
    address public owner;

    enum ArticleStatus { Submitted, UnderReview, Approved, Rejected }

    struct Review {
        address reviewer;
        ArticleStatus review;
    }

    struct Article {
        uint id;
        address author;
        string title;
        string content;
        string preview;
        ArticleStatus status;
        Review[3] reviews;
        uint reviewerCount;
        uint reviewCount;
        address[3] reviewers;
        address editor;
        uint price;
        string category; // Campo para categoria
    }

    struct Category {
        string name; // Nome da categoria
        Article[] articles; // Artigos pertencentes a esta categoria
    }

    mapping(uint => Article) public articles;
    mapping(address => bool) public reviewers;
    mapping(address => bool) public editors;
    mapping(address => bool) public authors;
    mapping(address => Article[]) private readerArticles;
    mapping(string => Category) public categories; // Mapeamento de categorias

    uint public articleCount = 0;

    event ArticleSubmitted(uint articleId, address author, string title);
    event ArticleReviewed(uint articleId, ArticleStatus status);
    event ArticlePurchased(uint articleId, address buyer);
    event ArticleCategorized(uint articleId, string category); // Evento para categorização

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyReviewer() {
        require(reviewers[msg.sender], "Not authorized");
        _;
    }

    modifier onlyEditor() {
        require(editors[msg.sender], "Not authorized");
        _;
    }

    function addAuthor(address _author) public onlyEditor {
        authors[_author] = true;
    }

    function addReviewer(address _reviewer) public onlyEditor {
        reviewers[_reviewer] = true;
    }

    function addEditor(address _editor) public {
        editors[_editor] = true;
    }

    constructor() {
        owner = msg.sender;
    }

    function submitArticle(string memory _title, string memory _content, string memory _preview, string memory _category) public {
        require(authors[msg.sender], "You don't have permission to submit articles.");
    
        Article storage newArticle = articles[articleCount];
        newArticle.id = articleCount;
        newArticle.author = msg.sender;
        newArticle.title = _title;
        newArticle.content = _content;
        newArticle.preview = _preview;
        newArticle.status = ArticleStatus.Submitted;
        newArticle.reviewerCount = 0;
        newArticle.reviewCount = 0;
        newArticle.price = 3.8e15;
        newArticle.category = _category; // Definindo a categoria

        for (uint i = 0; i < 3; i++) {
            newArticle.reviews[i] = Review(address(0), ArticleStatus.UnderReview);
            newArticle.reviewers[i] = address(0);
        }
        newArticle.editor = address(0);
        emit ArticleSubmitted(articleCount, msg.sender, _title);
        articleCount++;
    }

    function defineReviewer(uint _articleId, address _reviewer) public onlyEditor {
        require(_articleId >= 0 && _articleId < articleCount, "Invalid article ID");
        require(articles[_articleId].status == ArticleStatus.Submitted, "Invalid article");
        require(_reviewer != articles[_articleId].author, "Author can't be reviewer");
        require(reviewers[_reviewer], "Reviewer not found");
        require(articles[_articleId].reviewerCount < 3, "Article already has reviewers");
        require(articles[_articleId].author != msg.sender, "Can't define reviewers for your own article");
        require(articles[_articleId].editor == msg.sender || articles[_articleId].editor == address(0), "You are not the editor of this article");

        if(articles[_articleId].editor == address(0)){
            articles[_articleId].editor = msg.sender;
        }
        articles[_articleId].reviewers[articles[_articleId].reviewerCount] = _reviewer;
        articles[_articleId].status = articles[_articleId].reviewerCount == 2 ? ArticleStatus.UnderReview : ArticleStatus.Submitted;
        articles[_articleId].reviewerCount++;
    }
    
    function reviewArticle(uint _articleId, ArticleStatus _status) public onlyReviewer {
        require(_articleId >= 0 && _articleId < articleCount, "Invalid article ID");
        require(_status == ArticleStatus.Approved || _status == ArticleStatus.Rejected, "Invalid review");
        require(isArticleReviewer(articles[_articleId], msg.sender), "You don't have permission to review this article");
        Article storage article = articles[_articleId];
        article.reviews[article.reviewCount].reviewer = msg.sender;
        article.reviews[article.reviewCount].review = _status;
        article.reviewCount++;
        article.status = ArticleStatus.UnderReview;

        if(article.reviewCount == 3){
            article.status = defineStatus(_articleId);
            if(article.status == ArticleStatus.Approved) {
                addToCategory(article.category, article); // Adiciona o artigo à categoria se aprovado
            }
            emit ArticleReviewed(_articleId, article.status);
        }
    }

    function addToCategory(string memory _categoryName, Article storage _article) internal {
        Category storage category = categories[_categoryName];
        category.name = _categoryName; // Define o nome da categoria
        category.articles.push(_article); // Adiciona o artigo à categoria
        emit ArticleCategorized(_article.id, _categoryName); // Emite o evento de categorização
    }

    function defineStatus(uint _articleId) public view returns (ArticleStatus) {
        uint countApproves = 0;
        for(uint i = 0; i < 3; i++){
            if(articles[_articleId].reviews[i].review == ArticleStatus.Approved){
                countApproves++;
            }
        }
        return countApproves >= 2 ? ArticleStatus.Approved : ArticleStatus.Rejected;
    }

    function isArticleReviewer(Article memory _article, address _reviewer) public pure returns (bool){
        for(uint i = 0; i < _article.reviewers.length; i++){
            if(_reviewer == _article.reviewers[i]){
                return true;
            }
        }
        return false;
    }

    function buyArticle(uint _articleId) public payable {
        require(_articleId >= 0 && _articleId < articleCount, "Invalid article ID");
        Article storage article = articles[_articleId];
        require(article.status == ArticleStatus.Approved, "Article not approved");
        require(msg.value >= article.price, "Insufficient funds");
        
        address payable author = payable(article.author);
        address payable editor = payable(article.editor);
        address payable reviewer1 = payable(article.reviewers[0]);
        address payable reviewer2 = payable(article.reviewers[1]);
        address payable reviewer3 = payable(article.reviewers[2]);

        author.transfer(article.price / 2);
        editor.transfer(article.price / 8);
        reviewer1.transfer(article.price / 8);
        reviewer2.transfer(article.price / 8);
        reviewer3.transfer(article.price / 8);
        readerArticles[msg.sender].push(article);
        emit ArticlePurchased(_articleId, msg.sender);
    }

    function getArticles() public view returns (Article[] memory) {
        return readerArticles[msg.sender];
    }

    function getCategoryArticles(string memory _categoryName) public view returns (Category memory) {
        return categories[_categoryName];
    }
}
