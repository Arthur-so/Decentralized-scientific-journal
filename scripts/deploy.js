async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Endereços pré-definidos
    const authors = ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x2546BcD3c84621e976D8185a91A922aE77ECEc30"];
    const editors = ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E"];
    const reviewers = ["0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", "0x90F79bf6EB2c4f870365E785982E1f101E93b906", 
                       "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", "0xcd3B766CCDd6AE721141F452C550Ca635964ce71",
                       "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097", "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec"];

    const ScientificJournal = await ethers.getContractFactory("ScientificJournal");
    const journal = await ScientificJournal.deploy(authors, editors, reviewers);
    
    console.log("ScientificJournal deployed to:", journal.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
