import React, { useState , useEffect} from "react";
import { ethers } from 'ethers';
import ScientificJournalABI from "../ScientificJournal.json"; // O ABI gerado pelo Hardhat
import ArticlesToReview from "../../components/ArticlesToReview/ArticlesToReview"
import HeaderItem from "../../components/headerItem/HeaderItem";
import FooterItem from '../../components/footerItem/FooterItem';

const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

const AddReviewerPage = () => {
  const [reviewerAddress, setReviewerAddress] = useState("");
  const [articlesToReview, setArticlesToReview] = useState([]);
  const [articleId, setArticleId] = useState("");
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts);
        // console.log("Conta alterada:", accounts);
      });
    }
  }, []);

  const addReviewer = async (id, rev1, rev2, rev3) => {

    if (!ethers.isAddress(rev1) || !ethers.isAddress(rev2) || !ethers.isAddress(rev3) ) {
      alert('Endereço inválido.');
      return;
    }
    // console.log(id)
    // // Verificar se o ID do artigo não está vazio
    // if (!id || isNaN(id)) {
    //   alert('ID do artigo deve ser um número válido.');
    //   return;
    // }

    if (!window.ethereum) {
      console.log("MetaMask não detectado!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const journalContract = new ethers.Contract(contractAddress, ScientificJournalABI.abi, signer);
      // console.log(rev1)
      // console.log(rev2)
      // console.log(rev3)
      const tx1 = await journalContract.defineReviewer(id, rev1);
      await tx1.wait();

      const tx2 = await journalContract.defineReviewer(id, rev2);
      await tx2.wait();

      const tx3 = await journalContract.defineReviewer(id, rev3);
      await tx3.wait();
      console.log("Revisor adicionado com sucesso!");
      fetchArticles();
    } catch (error) {
      console.error("Erro ao adicionar revisor:", error);
    }
  };

  const fetchArticles = async () => {
    if (!window.ethereum) {
      console.log("MetaMask não detectado!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const journalContract = new ethers.Contract(contractAddress, ScientificJournalABI.abi, signer);
      const isEditor = await journalContract.isEditor();
      console.log(isEditor)
      if (isEditor == false) {
        return
      }
      const articles = await journalContract.getAllArticles();
      setArticlesToReview(articles);
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
    fetchArticles();
  }, []);


  return (
    <div>
      <HeaderItem/>
      <div>
        {articlesToReview.map((item, index) => (item.reviewers[0] == "0x0000000000000000000000000000000000000000" ||
          item.reviewers[1] == "0x0000000000000000000000000000000000000000" ||
          item.reviewers[2] == "0x0000000000000000000000000000000000000000" ) ? 
          (<ArticlesToReview id={index} title={item.title} content={item.content} category={item.category} preview={item.preview} rev1={item.reviewers[0]} rev2={item.reviewers[1]} rev3={item.reviewers[2]} sendReviewer={addReviewer}/> ) : (<></>)
        )}
      </div>
      <FooterItem/>
    </div>
  );
};

export default AddReviewerPage;
