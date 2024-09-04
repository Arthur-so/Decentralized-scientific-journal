import { useState, useEffect } from 'react'
import './UserReviewPage.css';
import { ethers } from "ethers";
import ScientificJournalABI from "../ScientificJournal.json"; // O ABI gerado pelo Hardhat
import FooterItem from '../../components/footerItem/FooterItem';
import HeaderItem from '../../components/headerItem/HeaderItem';
import ReviewUserItem from '../../components/reviewUserItem/ReviewUserItem';

function UserReviewPage() {
  const [articleId, setArticleId] = useState("");
  const [reviewStatus, setReviewStatus] = useState("Approved");
  const [reviewerArticles, setReviewerArticles] = useState([]);

  const fetchReviewerArticles = async () => {
    if (!window.ethereum) {
      console.log("MetaMask não detectado!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
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
    fetchReviewerArticles();
  }, []);

  const reviewArticle = async () => {
    if (!window.ethereum) {
      console.log("MetaMask não detectado!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const journalContract = new ethers.Contract(contractAddress, ScientificJournalABI.abi, signer);
      const tx = await journalContract.reviewArticle(articleId, reviewStatus === "Approved" ? 2 : 3); // 1 para Approved, 2 para Rejected
      await tx.wait();

      console.log("Revisão do artigo submetida com sucesso!");
      // Recarregar artigos após a revisão
      fetchReviewerArticles();
    } catch (error) {
      console.error("Erro ao revisar artigo:", error);
    }
  };

  return (
    <div className="UserReviewPage">
      <HeaderItem/>

      <main className="content">
        <div className="sidebar-div">
          <aside className="left-sidebar">
              <h2>Nome do Usuário</h2>
              <p>Biografia ou descrição breve.</p>
              <a href="#">Configurações</a>
          </aside>
        </div>

        <div className="main-content">
          <div className="central-section">
              {reviewerArticles.length > 0 ? (
                <ul>
                  {reviewerArticles.map((article, index) => (
                    <li key={index}>
                      <ReviewUserItem />
                      <strong>ID do Artigo:</strong> {Number(article.id).toString()} <br />
                      <strong>Título:</strong> {article.title} <br />
                      <strong>Status:</strong> {statusMapping[article.status]}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum artigo encontrado para revisão.</p>
              )}
          </div>
        </div>
      </main>

      <FooterItem/>
    </div>
  );
}

export default UserReviewPage;
