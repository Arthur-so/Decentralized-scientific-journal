import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import ScientificJournalABI from "../ScientificJournal.json"; // O ABI gerado pelo Hardhat
import FooterItem from '../../components/footerItem/FooterItem';
import HeaderItem from '../../components/headerItem/HeaderItem';
import ReviewUserItem from '../../components/reviewUserItem/ReviewUserItem';

const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

function ReviewArticlePage() {

  const [articleId, setArticleId] = useState("");
  const [reviewStatus, setReviewStatus] = useState("Approved");
  const [reviewerArticles, setReviewerArticles] = useState([]);
  const [account, setAccount] = useState(null);
  const categories = ["Biomedicine", "Engineering", "Information Technology", "Social Sciences", "Ecology"]

  async function getSigner(){
    if(!window.ethereum) return console.log("No Wallet found!");

    const provider = new ethers.BrowserProvider(window.ethereum);

    const accounts = await provider.send("eth_requestAccounts", []);
    if(!accounts || !accounts.length) return console.log("Wallet not authorized.");
    const signer = await provider.getSigner();
    return signer
  }


  const fetchReviewerArticles = async () => {
    if (!window.ethereum) {
      console.log("MetaMask não detectado!");
      return;
    }

    try {
      const signer = await getSigner();
      const journalContract = new ethers.Contract(contractAddress, ScientificJournalABI.abi, signer);

      const articles = await journalContract.getReviewerArticles();
      setReviewerArticles(articles);
    } catch (error) {
      console.error("Erro ao buscar artigos do revisor:", error);
    }
  };

  // Mapeamento de status
  const statusMapping = {
    2: "Aprovado",
    3: "Rejeitado"
  };

  useEffect(() => {
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts);
        // console.log("Conta alterada:", accounts);
      });
    }
    fetchReviewerArticles();
  }, []);

  const reviewArticleFunc = async (id, status) => {
    if (!window.ethereum) {
      console.log("MetaMask não detectado!");
      return;
    }

    try {
      const signer = await getSigner();

      const journalContract = new ethers.Contract(contractAddress, ScientificJournalABI.abi, signer);
      const tx = await journalContract.reviewArticle(id, status); // 1 para Approved, 2 para Rejected
      await tx.wait();

      console.log("Revisão do artigo submetida com sucesso!");
      // Recarregar artigos após a revisão
      fetchReviewerArticles();
    } catch (error) {
      console.error("Erro ao revisar artigo:", error);
    }
  };

  return (
    <div className="UserPostPage">
      <HeaderItem/>

      <h3>Artigos Para Revisão</h3>
      {reviewerArticles.length > 0 ? (
        <ul>
          {reviewerArticles.map((article, index) => (
            <ReviewUserItem id={Number(article.id)} title={article.title} content={article.content} category={categories[article.category]} preview={article.preview} status={article.status} sendReview={reviewArticleFunc}/>
          ))}
        </ul>
      ) : (
        <p>Nenhum artigo encontrado para revisão.</p>
      )}
      
      <FooterItem/>
    </div>
  );
};

export default ReviewArticlePage;
