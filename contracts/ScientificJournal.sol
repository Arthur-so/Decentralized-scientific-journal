// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract ScientificJournal {
    address public owner;
    //address priceFeedAddress = 0x14e613AC84a31f709eadbdF89C6CC390fDc9540A;
    //AggregatorV3Interface internal priceFeed;

    enum ArticleStatus { Submitted, UnderReview, Approved, Rejected}
    
    struct Review{
        address reviewer;
        ArticleStatus review;
    }

    struct Article {
        uint id;
        address author;
        //address[] co_authors;
        string title;
        string content;
        ArticleStatus status;
        Review [3] reviews;
        uint reviewerCount;
        uint reviewCount;
        address [3] reviewers;
        address editor;
        uint price;
    }

    mapping(uint => Article) public articles;
    mapping(address => bool) public reviewers;
    mapping(address => bool) public editors;
    mapping(address => bool) public authors;
    mapping(address => Article[]) private readerArticles;

    uint public articleCount = 0;
    
    event ArticleSubmitted(uint articleId, address author, string title);
    event ArticleReviewed(uint articleId, ArticleStatus status);
    event ArticlePurchased(uint articleId, address buyer);

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

    function addAuthor(address _author) public onlyEditor{
        authors[_author] = true;
    }

    function addReviewer(address _reviewer) public onlyEditor{
        reviewers[_reviewer] = true;
    }

    function addEditor(address _editor) public {
        editors[_editor] = true;
    }

    constructor() {
        owner = msg.sender;
        //priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /*function getLatestPrice() public view returns (uint256) {
        (,int price,,,) = priceFeed.latestRoundData();
        return uint256(price * 1e10); // Ajusta para 18 decimais
    }

    function convertUsdToCrypto(uint256 usdAmount) public view returns (uint256) {
        uint256 priceInUsd = getLatestPrice();
        return (usdAmount * 1e18) / priceInUsd;
    }*/

    function submitArticle(string memory _title, string memory _content) public {
        require(authors[msg.sender], "You don't have permission to submit articles.");
    
        Article storage newArticle = articles[articleCount];
        newArticle.id = articleCount;
        newArticle.author = msg.sender;
        newArticle.title = _title;
        newArticle.content = _content;
        newArticle.status = ArticleStatus.Submitted;
        newArticle.reviewerCount = 0;
        newArticle.reviewCount = 0;
        newArticle.price = 3.8e15;

        // Inicializando o array de reviews e reviewers manualmente
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
            emit ArticleReviewed(_articleId, article.status);
        }
    }

    function defineStatus(uint _articleId) public view returns (ArticleStatus) {
        uint countApproves = 0;
        for(uint i = 0; i < 3; i++){
             if(articles[_articleId].reviews[i].review == ArticleStatus.Approved){
                countApproves++;
            }
        }
        if(countApproves >= 2){
            return ArticleStatus.Approved;
        }
        else{
            return ArticleStatus.Rejected;
        }
    }

    function isArticleReviewer(Article memory _article, address _reviewer) public pure returns (bool){
        for(uint i = 0; i < _article.reviewers.length; i++){
            if(_reviewer == _article.reviewers[i]){
                return true;
            }
        }
        return false;
    }

    function buyArticle(uint _articleId) public payable{
        require(_articleId >= 0 && _articleId < articleCount, "Invalid article ID");
        Article storage article = articles[_articleId];
        require(article.status == ArticleStatus.Approved, "Article not approved");
        //10 dolares = 0.019 BNB = 1.9e16 wei de BNB
        //10 dolares = 0.0038 ETH = 3.8e15 wei de ETH
        require(msg.value >= article.price, "Insufficient funds");
        //require(msg.value >= 1.9e15, "Insufficient funds");
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

    function getArticles () public view returns (Article[] memory){
        return readerArticles[msg.sender];
    }

}