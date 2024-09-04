import './PostUserItem.css';

function PostUserItem(props) {
    function excludePost(){
        alert("Exclude");
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
                    <p>{props.preview}</p>
                </div>
                {/* <button className="exclude-button" onClick={() => excludePost()}>X</button> */}
            </div>
        </article>);
}

export default PostUserItem;