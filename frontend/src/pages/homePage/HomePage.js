import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { useState, useEffect } from 'react'
import './HomePage.css';
import FooterItem from '../../components/footerItem/FooterItem';
import HeaderItem from '../../components/headerItem/HeaderItem';
import HomeItem from '../../components/homeItem/HomeItem';
import testeImg from '../../assets/testImage.jpg';
import CategoryPage from '../categoryPage/CategoryPage';


function HomePage() {
    const [postsArray, setPostsArray] = useState([{id: 1, title: "Teste", description: "description"}, {id: 2, title: "Teste", description: "description"}])
    return (
        <div className="HomePage">
            <HeaderItem/>

            <main className="content">
                <div className="sidebar-div">
                    <aside className="left-sidebar">
                        <h4>Categorias</h4>
                        <ul>
                            <li><a href="#">Categoria 1</a></li>
                            <li><a href="#">Categoria 2</a></li>
                            <li><a href="#">Categoria 3</a></li>
                        </ul>
                        <h4>Pesquisar</h4>
                        <input type="text" placeholder="Buscar..."/>
                    </aside>
                </div>

                <div className="main-content">
                    <div className="central-section">
                        <HomeItem id={postsArray[0].id} title={postsArray[0].title} src={testeImg} description={postsArray[0].description}/>
                        <HomeItem id={postsArray[1].id} title={postsArray[1].title} src={testeImg} description={postsArray[1].description}/>

                        <Routes>
                        <Route path="/categoty/:id"  element={<CategoryPage/>} />
                        <Route render={() => <h1>404: page not found</h1>} />
                        </Routes>
                    </div>
                </div>
            </main>

            <FooterItem/>
        </div>
    );
}




export default HomePage;
