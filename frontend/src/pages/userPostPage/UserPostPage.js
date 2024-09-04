import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import ScientificJournalABI from "../ScientificJournal.json"; // O ABI gerado pelo Hardhat
import './UserPostPage.css';
import FooterItem from '../../components/footerItem/FooterItem';
import HeaderItem from '../../components/headerItem/HeaderItem';
import PostUserItem from '../../components/postUserItem/PostUserItem';
import categoriesData from '../../categories.json';

const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

function UserPostPage() {
  const categories = ["Biomedicine", "Engineering", "Information Technology", "Social Sciences", "Ecology"]
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState("");
  const [category, setCategory] = useState("0");
  const [postList, setPostList] = useState(false)
  const [account, setAccount] = useState(null)

  const [dataList, setDataList] = useState([])

  function addNewPost(){
    setPostList(true)
  }

  async function getSigner(){
    if(!window.ethereum) return console.log("No Wallet found!");

    const provider = new ethers.BrowserProvider(window.ethereum);

    const accounts = await provider.send("eth_requestAccounts", []);
    if(!accounts || !accounts.length) return console.log("Wallet not authorized.");
    const signer = await provider.getSigner();
    return signer
  }

  const fetchArticles = async () => {
    if (!window.ethereum) {
      console.log("MetaMask não detectado!");
      return;
    }

    try {
      const signer =  await getSigner();
      const journalContract = new ethers.Contract(contractAddress, ScientificJournalABI.abi, signer);

      const address = await signer.getAddress(); // Obtém o endereço do signer
      const articles = await journalContract.getItemsByAuthor(address); // Passa o endereço para a função
      
      setDataList(articles);
    } catch (error) {
      console.error("Erro ao buscar artigos do revisor:", error);
    }
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
      setAccount(accounts);
      // console.log("Conta alterada:", accounts);
    });
  }
    fetchArticles()
  }, [])

  const submitArticle = async () => {
    // console.log(title, content, preview, category);
    if (!window.ethereum) {
      console.log("MetaMask não detectado!");
      return;
    }

    try {
      const signer = await getSigner();

      const journalContract = new ethers.Contract(contractAddress, ScientificJournalABI.abi, signer);
      console.log("categoria: ")
      console.log(category)
      const tx = await journalContract.submitArticle(title, content, preview, category);
      await tx.wait();

      console.log("Artigo submetido com sucesso!");
      setPostList(false)
      fetchArticles();
    } catch (error) {
      console.error("Erro ao submeter artigo:", error);
    }
  };

  return (
    <div className="UserPostPage">
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
              <button className="post -new" onClick={() => addNewPost()}>
                <h3>Post article</h3>
              </button>
              <article className={postList  ? 'post -input' : 'post -input -inv'}>
                <div className='container-new-post'>
                  <div>
                    <input placeholder='Title' type='text' value={title} onChange={(e) => setTitle(e.target.value)}></input>
                    <input placeholder='Content' type='text' value={content} onChange={(e) => setContent(e.target.value)}></input>
                  </div>
                  <div>
                      <select className='select' value={categories[category]} onChange={(e) => setCategory(categories.indexOf(e.target.value).toString())}>
                        {categories.map((item, index) => (
                          <option key={index} value={item}>{item}</option>
                        ))}
                     </select>
                    <input placeholder='Preview' type='text' value={preview} onChange={(e) => setPreview(e.target.value)}></input>
                  </div>
                  <button className="send-button" onClick={(e) => { e.preventDefault(); submitArticle(); }}>Send!</button>
                </div>
              </article>
              <div>
                {dataList.map(item => <PostUserItem title={item.title} content={item.content} category={categories[item.category]} preview={item.preview}/>)} 
              </div>
          </div>
        </div>
      </main>

      <FooterItem/>
    </div>
  );
};

export default UserPostPage;
