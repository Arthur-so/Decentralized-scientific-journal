const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ScientificJournal Contract", function () {
  let Journal;
  let journal;
  let owner, owner2;
  let editor1, reviewer1, reviewer2, reviewer3, author1;

  beforeEach(async function () {
    Journal = await ethers.getContractFactory("ScientificJournal");
    journal = await Journal.deploy([],[],[]);  // Deploy the contract
    [owner, owner2, editor1, reviewer1, reviewer2, reviewer3, author1] = await ethers.getSigners();
    
    // Adicionando editor, autores e revisores automaticamente
    await journal.addEditor(editor1.address);
    await journal.connect(editor1).addAuthor(author1.address);
    await journal.connect(editor1).addReviewer(reviewer1.address);
    await journal.connect(editor1).addReviewer(reviewer2.address);
    await journal.connect(editor1).addReviewer(reviewer3.address);
  });

  it("Deve permitir que um autor submeta um artigo", async function () {
    await expect(journal.connect(author1).submitArticle("Título do Artigo", "Conteúdo do Artigo", "Preview", "Categoria do Artigo"))
      .to.emit(journal, "ArticleSubmitted")
      .withArgs(0, author1.address, "Título do Artigo");

    const article = await journal.articles(0);
    expect(article.title).to.equal("Título do Artigo");
    expect(article.content).to.equal("Conteúdo do Artigo");
    expect(article.category).to.equal("Categoria do Artigo");
    expect(article.author).to.equal(author1.address);
  });

  it("Deve permitir que um editor defina revisores para um artigo", async function () {
    await journal.connect(author1).submitArticle("Título do Artigo", "Conteúdo do Artigo", "Preview", "Categoria do Artigo");

    await journal.connect(editor1).defineReviewer(0, reviewer1.address);
    await journal.connect(editor1).defineReviewer(0, reviewer2.address);
    await journal.connect(editor1).defineReviewer(0, reviewer3.address);

    const article = await journal.articles(0);
    expect(article.reviewerCount).to.equal(3);
  });

  it("Deve permitir que um revisor aprove ou rejeite um artigo", async function () {
    await journal.connect(author1).submitArticle("Título do Artigo", "Conteúdo do Artigo", "Preview", "Categoria do Artigo");

    await journal.connect(editor1).defineReviewer(0, reviewer1.address);
    await journal.connect(editor1).defineReviewer(0, reviewer2.address);
    await journal.connect(editor1).defineReviewer(0, reviewer3.address);

    await journal.connect(reviewer1).reviewArticle(0, 2); // Approved
    await journal.connect(reviewer2).reviewArticle(0, 3); // Rejected
    await journal.connect(reviewer3).reviewArticle(0, 2); // Approved

    const article = await journal.articles(0);
    expect(article.reviewCount).to.equal(3);
    expect(article.status).to.equal(2); // Status: Approved
  });

  it("Deve permitir que um usuário compre um artigo aprovado", async function () {
    await journal.connect(author1).submitArticle("Título do Artigo", "Conteúdo do Artigo", "Preview", "Categoria do Artigo");

    await journal.connect(editor1).defineReviewer(0, reviewer1.address);
    await journal.connect(editor1).defineReviewer(0, reviewer2.address);
    await journal.connect(editor1).defineReviewer(0, reviewer3.address);

    await journal.connect(reviewer1).reviewArticle(0, 2); // Approved
    await journal.connect(reviewer2).reviewArticle(0, 2); // Approved
    await journal.connect(reviewer3).reviewArticle(0, 2); // Approved

    await expect(journal.connect(owner).buyArticle(0, { value: ethers.parseEther("0.0038") }))
      .to.emit(journal, "ArticlePurchased")
      .withArgs(0, owner.address);

    const articlesPurchased = await journal.getArticles();
    expect(articlesPurchased.length).to.equal(1);
    expect(articlesPurchased[0].title).to.equal("Título do Artigo");
    expect(articlesPurchased[0].content).to.equal("Conteúdo do Artigo");
    expect(articlesPurchased[0].category).to.equal("Categoria do Artigo");

  });

  it("Deve permitir que um usuário visualize apenas os seus artigos comprados", async function () {
    await journal.connect(author1).submitArticle("Título do Artigo", "Conteúdo do Artigo", "Preview", "Categoria do Artigo");

    await journal.connect(editor1).defineReviewer(0, reviewer1.address);
    await journal.connect(editor1).defineReviewer(0, reviewer2.address);
    await journal.connect(editor1).defineReviewer(0, reviewer3.address);

    await journal.connect(reviewer1).reviewArticle(0, 2); // Approved
    await journal.connect(reviewer2).reviewArticle(0, 2); // Approved
    await journal.connect(reviewer3).reviewArticle(0, 2); // Approved

    await journal.connect(author1).submitArticle("Título do Artigo 2", "Conteúdo do Artigo 2", "Preview", "Categoria do Artigo");

    await journal.connect(editor1).defineReviewer(1, reviewer1.address);
    await journal.connect(editor1).defineReviewer(1, reviewer2.address);
    await journal.connect(editor1).defineReviewer(1, reviewer3.address);

    await journal.connect(reviewer1).reviewArticle(1, 2); // Approved
    await journal.connect(reviewer2).reviewArticle(1, 2); // Approved
    await journal.connect(reviewer3).reviewArticle(1, 2); // Approved

    await journal.connect(author1).submitArticle("Título do Artigo 3", "Conteúdo do Artigo 3", "Preview", "Categoria do Artigo");

    await journal.connect(editor1).defineReviewer(2, reviewer1.address);
    await journal.connect(editor1).defineReviewer(2, reviewer2.address);
    await journal.connect(editor1).defineReviewer(2, reviewer3.address);

    await journal.connect(reviewer1).reviewArticle(2, 2); // Approved
    await journal.connect(reviewer2).reviewArticle(2, 2); // Approved
    await journal.connect(reviewer3).reviewArticle(2, 2); // Approved

    await expect(journal.connect(owner).buyArticle(0, { value: ethers.parseEther("0.0038") }))
      .to.emit(journal, "ArticlePurchased")
      .withArgs(0, owner.address);
    
    await expect(journal.connect(owner).buyArticle(1, { value: ethers.parseEther("0.0038") }))
      .to.emit(journal, "ArticlePurchased")
      .withArgs(1, owner.address);

    await expect(journal.connect(owner2).buyArticle(2, { value: ethers.parseEther("0.0038") }))
      .to.emit(journal, "ArticlePurchased")
      .withArgs(2, owner2.address);

    const articlesPurchasedOwner1 = await journal.connect(owner).getArticles();
    const articlesPurchasedOwner2 = await journal.connect(owner2).getArticles();
    expect(articlesPurchasedOwner1.length).to.equal(2);
    expect(articlesPurchasedOwner2.length).to.equal(1);


    // Asserções para cada artigo comprado
    for (let i = 0; i < articlesPurchasedOwner1.length; i++) {
        const article = articlesPurchasedOwner1[i];
        if (i === 0) {
        expect(article.title).to.equal("Título do Artigo");
        expect(article.content).to.equal("Conteúdo do Artigo");
        expect(article.category).to.equal("Categoria do Artigo");
        } else if (i === 1) {
        expect(article.title).to.equal("Título do Artigo 2");
        expect(article.content).to.equal("Conteúdo do Artigo 2");
        }
    }

    const article = articlesPurchasedOwner2[0];
    expect(article.title).to.equal("Título do Artigo 3");
    expect(article.content).to.equal("Conteúdo do Artigo 3");
    expect(article.category).to.equal("Categoria do Artigo");
  });

  it("Deve estar sem nenhuma categoria antes de considerar como aprovado", async function () {
    await journal.connect(author1).submitArticle("Título do Artigo", "Conteúdo do Artigo", "Preview", "Categoria do Artigo");

    await journal.connect(editor1).defineReviewer(0, reviewer1.address);
    await journal.connect(editor1).defineReviewer(0, reviewer2.address);
    await journal.connect(editor1).defineReviewer(0, reviewer3.address);

    const category = await journal.categories("Categoria do Artigo");
    expect(category).to.equal("");

  });

  it("Deve adicionar categoria após ser aprovado", async function () {
    await journal.connect(author1).submitArticle("Título do Artigo", "Conteúdo do Artigo", "Preview", "Categoria do Artigo");

    await journal.connect(editor1).defineReviewer(0, reviewer1.address);
    await journal.connect(editor1).defineReviewer(0, reviewer2.address);
    await journal.connect(editor1).defineReviewer(0, reviewer3.address);

    await journal.connect(reviewer1).reviewArticle(0, 2); // Approved
    await journal.connect(reviewer2).reviewArticle(0, 3); // Rejected
    await journal.connect(reviewer3).reviewArticle(0, 2); // Approved

    const category = await journal.getCategoryArticles("Categoria do Artigo");
    expect(category.name).to.equal("Categoria do Artigo");

  });

  it("Deve ser possível pré-visualizar artigos de uma determinada categoria", async function () {
    await journal.connect(author1).submitArticle("Título do Artigo", "Conteúdo do Artigo", "Preview", "Categoria do Artigo");

    await journal.connect(editor1).defineReviewer(0, reviewer1.address);
    await journal.connect(editor1).defineReviewer(0, reviewer2.address);
    await journal.connect(editor1).defineReviewer(0, reviewer3.address);

    await journal.connect(reviewer1).reviewArticle(0, 2); // Approved
    await journal.connect(reviewer2).reviewArticle(0, 3); // Rejected
    await journal.connect(reviewer3).reviewArticle(0, 2); // Approved

    await journal.connect(author1).submitArticle("Título do Artigo 1", "Conteúdo do Artigo 1", "Preview 1", "Categoria do Artigo");

    await journal.connect(editor1).defineReviewer(1, reviewer1.address);
    await journal.connect(editor1).defineReviewer(1, reviewer2.address);
    await journal.connect(editor1).defineReviewer(1, reviewer3.address);

    await journal.connect(reviewer1).reviewArticle(1, 2); // Approved
    await journal.connect(reviewer2).reviewArticle(1, 3); // Rejected
    await journal.connect(reviewer3).reviewArticle(1, 2); // Approved

    await journal.connect(author1).submitArticle("Título do Artigo 2", "Conteúdo do Artigo 2", "Preview 2", "Categoria do Artigo 2");

    await journal.connect(editor1).defineReviewer(2, reviewer1.address);
    await journal.connect(editor1).defineReviewer(2, reviewer2.address);
    await journal.connect(editor1).defineReviewer(2, reviewer3.address);

    await journal.connect(reviewer1).reviewArticle(2, 2); // Approved
    await journal.connect(reviewer2).reviewArticle(2, 3); // Rejected
    await journal.connect(reviewer3).reviewArticle(2, 2); // Approved

    const category1 = await journal.getCategoryArticles("Categoria do Artigo");
    const category2 = await journal.getCategoryArticles("Categoria do Artigo 2");
    expect(category1.previews.length).to.equal(2);
    expect(category2.previews.length).to.equal(1);

    expect(category1.previews[0].title).to.equal("Título do Artigo");
    expect(category1.previews[0].articleId).to.equal(0);
    expect(category1.previews[0].preview).to.equal("Preview");

    expect(category1.previews[1].title).to.equal("Título do Artigo 1");
    expect(category1.previews[1].articleId).to.equal(1);
    expect(category1.previews[1].preview).to.equal("Preview 1");

    expect(category2.previews[0].title).to.equal("Título do Artigo 2");
    expect(category2.previews[0].articleId).to.equal(2);
    expect(category2.previews[0].preview).to.equal("Preview 2");

  });

  it("Deve ser possível pré-visualizar todos artigos aprovados", async function () {
    await journal.connect(author1).submitArticle("Título do Artigo", "Conteúdo do Artigo", "Preview", "Categoria do Artigo");

    await journal.connect(editor1).defineReviewer(0, reviewer1.address);
    await journal.connect(editor1).defineReviewer(0, reviewer2.address);
    await journal.connect(editor1).defineReviewer(0, reviewer3.address);

    await journal.connect(reviewer1).reviewArticle(0, 2); // Approved
    await journal.connect(reviewer2).reviewArticle(0, 3); // Rejected
    await journal.connect(reviewer3).reviewArticle(0, 2); // Approved

    await journal.connect(author1).submitArticle("Título do Artigo 1", "Conteúdo do Artigo 1", "Preview 1", "Categoria do Artigo");

    await journal.connect(editor1).defineReviewer(1, reviewer1.address);
    await journal.connect(editor1).defineReviewer(1, reviewer2.address);
    await journal.connect(editor1).defineReviewer(1, reviewer3.address);

    await journal.connect(reviewer1).reviewArticle(1, 2); // Approved
    await journal.connect(reviewer2).reviewArticle(1, 3); // Rejected
    await journal.connect(reviewer3).reviewArticle(1, 2); // Approved

    await journal.connect(author1).submitArticle("Título do Artigo 2", "Conteúdo do Artigo 2", "Preview 2", "Categoria do Artigo 2");

    await journal.connect(editor1).defineReviewer(2, reviewer1.address);
    await journal.connect(editor1).defineReviewer(2, reviewer2.address);
    await journal.connect(editor1).defineReviewer(2, reviewer3.address);

    await journal.connect(reviewer1).reviewArticle(2, 2); // Approved
    await journal.connect(reviewer2).reviewArticle(2, 3); // Rejected
    await journal.connect(reviewer3).reviewArticle(2, 2); // Approved

    const previews = await journal.getPreviews();
    expect(previews.length).to.equal(3);

    expect(previews[0].title).to.equal("Título do Artigo");
    expect(previews[0].articleId).to.equal(0);
    expect(previews[0].preview).to.equal("Preview");

    expect(previews[1].title).to.equal("Título do Artigo 1");
    expect(previews[1].articleId).to.equal(1);
    expect(previews[1].preview).to.equal("Preview 1");

    expect(previews[2].title).to.equal("Título do Artigo 2");
    expect(previews[2].articleId).to.equal(2);
    expect(previews[2].preview).to.equal("Preview 2");
  });

  it("Deve permitir que um revisor visualize todos os artigos que ele precisa revisar", async function () {
    await journal.connect(author1).submitArticle("Título do Artigo", "Conteúdo do Artigo", "Preview", "Categoria do Artigo");
    await journal.connect(author1).submitArticle("Título do Artigo 2", "Conteúdo do Artigo 2", "Preview 2", "Categoria do Artigo 2");
    await journal.connect(author1).submitArticle("Título do Artigo 3", "Conteúdo do Artigo 3", "Preview 3", "Categoria do Artigo 3");



    await journal.connect(editor1).defineReviewer(0, reviewer1.address);
    await journal.connect(editor1).defineReviewer(1, reviewer2.address);
    await journal.connect(editor1).defineReviewer(2, reviewer1.address);



    const articlesReviewer1 = await journal.connect(reviewer1).getReviewerArticles();
    const articlesReviewer2 = await journal.connect(reviewer2).getReviewerArticles();

    expect(articlesReviewer1.length).to.equal(2);
    expect(articlesReviewer2.length).to.equal(1);
  });

});
