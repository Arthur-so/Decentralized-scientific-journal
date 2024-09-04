import './HeaderItem.css';

function HeaderItem() {
    return (
        <header>
            <div className="logo">
                <h1>SciChain</h1>
            </div>
            <nav>
                <a href="#">Home</a>
                <a href="#">Sobre</a>
                <a href="#">Contato</a>
            </nav>
        </header>);
}

export default HeaderItem;