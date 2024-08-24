async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deployando contrato com o endereço:", deployer.address);
  
    const Journal = await ethers.getContractFactory("ScientificJournal");
    const journal = await Journal.deploy();
  
    console.log("Contrato implantado em:", journal.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  