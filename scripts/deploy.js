async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Endereços pré-definidos
    const authors = ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"];
    const editors = ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8"];
    const reviewers = ["0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", "0x90F79bf6EB2c4f870365E785982E1f101E93b906", "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"];

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
