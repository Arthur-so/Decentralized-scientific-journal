import { useState } from 'react';
import './HomeItem.css';
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";

function HomeItem(props) {
    return (
        <Link to={`/category/${props.id}`}>
            <button className='home-post'>
                <div className='home-container-post'>
                    <h3>{props.title}</h3>
                    <div>
                        <img src={props.src}/>
                        <p>{props.description}</p>
                    </div>
                </div>
            </button>
        </Link>);
}

export default HomeItem;