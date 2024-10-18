const hre = require('hardhat');
// 0x0165878A594ca255338adfa4d48449f69242Eb8F
async function main() {
  const CrowdFunding = await hre.ethers.getContractFactory("CrowdFunding");
  const crowdFunding = await CrowdFunding.deploy();
  
  // await crowdFunding.deployed();
  await crowdFunding.waitForDeployment;

  // console.log(`CrowdFunding deployed to ${crowdFunding.address()}`);
  console.log(`CrowdFunding deployed to ${crowdFunding.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});