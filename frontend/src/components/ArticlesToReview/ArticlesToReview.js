import './ArticlesToReview.css';
import React, { useState, useEffect } from 'react';

function ArticlesToReview(props) {
    const [rev1U, setRev1U] = useState(props.rev1);
    const [rev2U, setRev2U] = useState(props.rev2);
    const [rev3U, setRev3U] = useState(props.rev3);
    function addReviewer(){
        props.sendReviewer(props.id, rev1U, rev2U, rev3U)
    }

    return (
        <article className="post">
            <div className='container-post'>
                <div>
                    <h3>{props.title}</h3>
                    <p>{props.content}</p>
                </div>
                <div>
                    <p>{props.category}</p>
                    <p>{props.visualizerLink}</p>
                </div>
                <input type='text' value={rev1U} onChange={(e) => setRev1U(e.target.value)}></input>
                <input type='text' value={rev2U} onChange={(e) => setRev2U(e.target.value)}></input>
                <input type='text' value={rev3U} onChange={(e) => setRev3U(e.target.value)}></input>
                <button onClick={addReviewer}>+</button>
            </div>
        </article>);
}

export default ArticlesToReview;