import './ReviewUserItem.css';

function ReviewUserItem(props) {
    function acceptPost(){
        props.sendReview(props.id, 2)
    }

    function rejectPost(){
        props.sendReview(props.id, 3)
    }

    return (
        <article className="review-post">
            <div className='container-post'>
                <div>
                    <h3>{props.title}</h3>
                    <p>{props.content}</p>
                </div>
                <div>
                    <p>{props.category}</p>
                    <p>{props.preview}</p>
                    <p>{props.status}</p>
                </div>
                {/* <div className={props.inv  ? '' : '-inv'}> */}
                <div>
                    <button className="accept-button" onClick={acceptPost}>Y</button>
                    <button className="exclude-button" onClick={rejectPost}>X</button>
                    {/* <button className="feedback-button" onClick={props.returnPost(props.id)}>-</button> */}
                </div>
            </div>
            {/* <div className={props.inv  ? 'container-post' : 'container-post -inv'}> */}
            {/* <div className={container-post}>
                <textarea className="story" rows="4" cols="120" placeholder='Write a feedback...'></textarea>
            </div> */}
        </article>);
}

export default ReviewUserItem;