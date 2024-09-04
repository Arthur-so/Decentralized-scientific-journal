import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import ScientificJournalABI from "../ScientificJournal.json"; // Certifique-se de que o ABI está correto
import HeaderItem from '../../components/headerItem/HeaderItem';
import FooterItem from '../../components/footerItem/FooterItem';

const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

const PurchasedArticlesPage = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetchPurchasedArticles();
  }, []);

  const fetchPurchasedArticles = async () => {
    if (!window.ethereum) {
      console.log("MetaMask não detectado!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const journalContract = new ethers.Contract(contractAddress, ScientificJournalABI.abi, signer);

      const purchasedArticles = await journalContract.getArticles(); // Obtém os artigos comprados
      const formattedArticles = purchasedArticles.map((article) => ({
        articleId: Number(article.id),
        title: article.title,
        content: article.content,
        preview: article.preview,
      }));

      setArticles(formattedArticles);
    } catch (error) {
      console.error("Erro ao obter os artigos comprados:", error);
    }
  };

  return (
    <div className="UserPostPage">
      <HeaderItem/>
      <h2>Artigos Comprados</h2>
      <ul>
        {articles.length > 0 ? (
          articles.map((article, index) => (
            <li key={index}>
              <h3>{article.title}</h3>
              <p>{article.content}</p>
              <small>Article ID: {article.articleId.toString()}</small>
              <p><strong>Preview:</strong> {article.preview}</p>
            </li>
          ))
        ) : (
          <p>Nenhum artigo comprado ainda.</p>
        )}
      </ul>
      <FooterItem/>
    </div>
  );
};

export default PurchasedArticlesPage;
