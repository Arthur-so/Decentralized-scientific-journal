# ScientificJournal Smart Contract

## Overview

The `ScientificJournal` smart contract is designed to manage the submission, review, and purchase of scientific articles. It allows authors to submit articles, reviewers to review them, editors to manage the review process, and readers to purchase approved articles.

## Features

- **Article Submission**: Authors can submit articles with a title, content, preview, and category.
- **Review Process**: Articles undergo a peer-review process by three reviewers. Articles can be approved or rejected based on the majority of reviews.
- **Purchase Mechanism**: Approved articles can be purchased by readers. The payment is distributed among the author, editor, and reviewers.
- **Role Management**: The contract manages different roles such as authors, reviewers, and editors, each with specific permissions.
- **Event Logging**: The contract emits events for significant actions like article submission, review completion, and article purchase.

## Contract Structure

### Enums

- `ArticleStatus`: Defines the status of an article (`Submitted`, `UnderReview`, `Approved`, `Rejected`).

### Structs

- `Review`: Stores the review information for an article, including the reviewer's address and the review status.
- `Article`: Represents an article with fields for ID, author, title, content, preview, status, reviews, reviewer addresses, editor, price, and category.

### Mappings

- `articles`: Maps article IDs to `Article` structs.
- `reviewers`, `editors`, `authors`: Track addresses and their associated roles (reviewer, editor, author).
- `readerArticleIds`: Maps reader addresses to an array of article IDs they have purchased.

### Modifiers

- `onlyOwner`: Restricts access to the contract owner.
- `onlyReviewer`: Restricts access to reviewers.
- `onlyEditor`: Restricts access to editors.

## Functions

### Constructor

- `constructor(address[] memory _authors, address[] memory _editors, address[] memory _reviewers)`: Initializes the contract by setting up the owner, authors, editors, and reviewers.

### Article Submission

- `submitArticle(string memory _title, string memory _content, string memory _preview, string memory _category)`: Allows an author to submit an article.

### Review Management

- `defineReviewer(uint _articleId, address _reviewer)`: Assigns a reviewer to an article. Only editors can assign reviewers.
- `reviewArticle(uint _articleId, ArticleStatus _status)`: Allows a reviewer to review an article. The status can be set to `Approved` or `Rejected`.
- `defineStatus(uint _articleId)`: Determines the final status of an article based on the reviews.

### Article Purchase

- `buyArticle(uint _articleId)`: Allows a reader to purchase an approved article. The payment is split among the author, editor, and reviewers.

### Article Retrieval

- `getArticles()`: Retrieves articles purchased by the caller.
- `getReviewerArticles()`: Retrieves articles assigned to the caller for review.
- `getItemsByAuthor(address _author)`: Retrieves articles submitted by a specific author.
- `getAllArticles()`: Retrieves all articles in the system.

## Events

- `ArticleSubmitted(uint indexed articleId, address indexed author, string title)`: Emitted when an article is submitted.
- `ArticleReviewed(uint indexed articleId, ArticleStatus status)`: Emitted when an article's review process is completed.
- `ArticlePurchased(uint indexed articleId, address indexed buyer)`: Emitted when an article is purchased.

## Usage

To interact with the contract, ensure that your address is registered as an author, reviewer, or editor. Authors can submit articles, reviewers can review assigned articles, editors can manage the review process, and readers can purchase approved articles.

