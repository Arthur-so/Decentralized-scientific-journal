// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ScientificJournal {
    address public owner;
    enum ArticleStatus { Submitted, UnderReview, Approved, Rejected }
    struct Review { address reviewer; ArticleStatus review; }
    struct Article {
        uint id;
        address author;
        string title;
        string content;
        string preview;
        ArticleStatus status;
        Review[3] reviews;
        uint reviewCount;
        uint reviewCountStatus;
        address[3] reviewers;
        address editor;
        uint price;
        string category;
    }

    mapping(uint => Article) public articles;
    mapping(address => bool) public reviewers;
    mapping(address => bool) public editors;
    mapping(address => bool) public authors;
    mapping(address => uint[]) private readerArticleIds;
    uint public articleCount;

    event ArticleSubmitted(uint indexed articleId, address indexed author, string title);
    event ArticleReviewed(uint indexed articleId, ArticleStatus status);
    event ArticlePurchased(uint indexed articleId, address indexed buyer);

    modifier onlyOwner() { require(msg.sender == owner, "Not authorized"); _; }
    modifier onlyReviewer() { require(reviewers[msg.sender], "Not authorized"); _; }
    modifier onlyEditor() { require(editors[msg.sender], "Not authorized"); _; }

    constructor(address[] memory _authors, address[] memory _editors, address[] memory _reviewers) {
        owner = msg.sender;
        for (uint i = 0; i < _authors.length; i++) authors[_authors[i]] = true;
        for (uint i = 0; i < _editors.length; i++) editors[_editors[i]] = true;
        for (uint i = 0; i < _reviewers.length; i++) reviewers[_reviewers[i]] = true;
    }

    function submitArticle(string memory _title, string memory _content, string memory _preview, string memory _category) public {
        require(authors[msg.sender], "Not an authorized author");

        Article storage newArticle = articles[articleCount];
        newArticle.id = articleCount;
        newArticle.author = msg.sender;
        newArticle.title = _title;
        newArticle.content = _content;
        newArticle.preview = _preview;
        newArticle.status = ArticleStatus.Submitted;
        newArticle.price = 3.8e15;
        newArticle.category = _category;

        for (uint i = 0; i < 3; i++) {
            newArticle.reviews[i] = Review(address(0), ArticleStatus.UnderReview);
            newArticle.reviewers[i] = address(0);
        }
        emit ArticleSubmitted(articleCount, msg.sender, _title);
        articleCount++;
    }

    function defineReviewer(uint _articleId, address _reviewer) public onlyEditor {
        Article storage article = articles[_articleId];
        require(article.status == ArticleStatus.Submitted, "Invalid article status");
        require(reviewers[_reviewer], "Not an authorized reviewer");
        require(article.reviewCount < 3, "Reviewers limit reached");

        if (article.editor == address(0)) article.editor = msg.sender;
        require(article.editor == msg.sender, "Not the editor of this article");

        article.reviewers[article.reviewCount] = _reviewer;
        article.status = (article.reviewCount == 2) ? ArticleStatus.UnderReview : ArticleStatus.Submitted;
        article.reviewCount++;
    }

    
    function reviewArticle(uint _articleId, ArticleStatus _status) public onlyReviewer {
        require(_articleId >= 0 && _articleId < articleCount, "Invalid article ID");
        require(_status == ArticleStatus.Approved || _status == ArticleStatus.Rejected, "Invalid review");
        require(isReviewer(articles[_articleId], msg.sender), "You don't have permission to review this article");
        Article storage article = articles[_articleId];
        article.reviews[article.reviewCountStatus].review = _status;
        article.status = ArticleStatus.UnderReview;
        article.reviewCountStatus++;

        if(article.reviewCountStatus == 3){
            article.status = defineStatus(_articleId);
            emit ArticleReviewed(_articleId, article.status);
        }
    }

    function defineStatus(uint _articleId) public view returns (ArticleStatus) {
        Article storage article = articles[_articleId];
        uint countApproves = 0;
        for (uint i = 0; i < 3; i++) {
            if (article.reviews[i].review == ArticleStatus.Approved) {
                countApproves++;
            }
        }
        return countApproves >= 2 ? ArticleStatus.Approved : ArticleStatus.Rejected;
    }

    function isReviewer(Article storage article, address _reviewer) internal view returns (bool) {
        for (uint i = 0; i < 3; i++) if (article.reviewers[i] == _reviewer) return true;
        return false;
    }

    function buyArticle(uint _articleId) public payable {
        Article storage article = articles[_articleId];
        require(article.status == ArticleStatus.Approved, "Article not approved");
        require(msg.value >= article.price, "Insufficient funds");

        uint share = article.price / 8;
        payable(article.author).transfer(article.price / 2);
        if (article.editor != address(0)) payable(article.editor).transfer(share);
        for (uint i = 0; i < 3; i++) if (article.reviewers[i] != address(0)) payable(article.reviewers[i]).transfer(share);

        readerArticleIds[msg.sender].push(_articleId);
        emit ArticlePurchased(_articleId, msg.sender);
    }

    function getArticles() public view returns (Article[] memory) {
        uint[] storage ids = readerArticleIds[msg.sender];
        Article[] memory result = new Article[](ids.length);
        for (uint i = 0; i < ids.length; i++) result[i] = articles[ids[i]];
        return result;
    }

    function getReviewerArticles() public view onlyReviewer returns (Article[] memory) {
        uint count;
        for (uint i = 0; i < articleCount; i++) if (isReviewer(articles[i], msg.sender)) count++;

        Article[] memory result = new Article[](count);
        uint index;
        for (uint i = 0; i < articleCount; i++) if (isReviewer(articles[i], msg.sender)) result[index++] = articles[i];
        return result;
    }

    function getItemsByAuthor(address _author) public view returns (Article[] memory) {
        uint count;
        for (uint i = 0; i < articleCount; i++) if (articles[i].author == _author) count++;

        Article[] memory result = new Article[](count);
        uint index;
        for (uint i = 0; i < articleCount; i++) if (articles[i].author == _author) result[index++] = articles[i];
        return result;
    }

    function getAllArticles() public view returns (Article[] memory) {
        Article[] memory result = new Article[](articleCount);
        for (uint i = 0; i < articleCount; i++) result[i] = articles[i];
        return result;
    }
}
