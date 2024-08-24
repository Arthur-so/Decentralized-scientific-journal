async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Endereços pré-definidos
    // const authors = ["0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", "0xdD2FD4581271e230360230F9337D5c0430Bf44C0"];
    // const editors = ["0xbDA5747bFD65F08deb54cb465eB87D40e51B197E", "0x2546BcD3c84621e976D8185a91A922aE77ECEc30"];
    // const reviewers = ["0xcd3B766CCDd6AE721141F452C550Ca635964ce71", "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097", "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec"];

    const ScientificJournal = await ethers.getContractFactory("ScientificJournal");
    // const journal = await ScientificJournal.deploy(authors, editors, reviewers);
    const journal = await ScientificJournal.deploy(["0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"],
        ["0xbDA5747bFD65F08deb54cb465eB87D40e51B197E"],
        ["0xcd3B766CCDd6AE721141F452C550Ca635964ce71", "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097", "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec"]);


    console.log("ScientificJournal deployed to:", journal.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
