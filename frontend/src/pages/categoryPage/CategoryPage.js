import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useParams } from "react-router-dom";
import ScientificJournalABI from "../ScientificJournal.json";
import categoriesData from '../../categories.json'; // Importa o JSON

const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

const CategoryPage = () => {
  const { id: categoryId } = useParams(); // 'id' é o nome da rota dinâmica
  const [allArticles, setAllArticles] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Substitua os números por suas representações textuais
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const fetchCategory = async () => {
      if (!window.ethereum) {
        console.log("MetaMask não detectado!");
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const journalContract = new ethers.Contract(contractAddress, ScientificJournalABI.abi, signer);
        const articlesObject = await journalContract.getAllArticles();
        
        // Acumular os artigos no estado allArticles
        const articlesArray = articlesObject.map(article => ({
          id: Number(article.id),
          title: article.title,
          preview: article.preview,
          category: article.category
        }));

        setAllArticles(articlesArray); // Atualiza o estado de allArticles
      } catch (error) {
        console.error("Erro ao obter previews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  useEffect(() => {
    if (allArticles.length > 0) {
      const filteredArticles = allArticles.filter(item => item.category === categoryId);
      setSelectedArticles(filteredArticles);
    }
  }, [allArticles, categoryId]);

  const category = categoriesData.find(cat => cat.id === parseInt(categoryId)); // Busca os detalhes da categoria


  const buyArticle = async (articleId) => {
    if (!window.ethereum) {
      console.log("MetaMask não detectado!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const journalContract = new ethers.Contract(contractAddress, ScientificJournalABI.abi, signer);

      const tx = await journalContract.buyArticle(articleId, { value: ethers.parseEther(amount) });
      await tx.wait(); // Aguarda a confirmação da transação
      console.log("Artigo comprado com sucesso!");
    } catch (error) {
      console.error("Erro ao comprar o artigo:", error);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h2>Previews na Categoria: {category.category}</h2>
      {selectedArticles.length === 0 ? (
        <p>Nenhum preview encontrado para esta categoria.</p>
      ) : (
        <ul>
          {selectedArticles.map((item, index) => (
            <li key={index}>
              <h3>{item.title}</h3>
              <p>{item.preview}</p>
              <p>{item.content}</p>
              <input
                type="text"
                placeholder="Valor (em ETH)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button className="accept-button" onClick={() => buyArticle(item.id)}>+</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryPage;