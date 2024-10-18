import React, { useState, useEffect } from "react";
import Wenb3Modal from "web3modal";
import { ethers, JsonRpcProvider } from "ethers";

// Internal Import
import { CrowdFundingABI, CrowdFundingAddress } from "./contants";

// Fetching Smart Contract
const fetchContract = (signerOrProvider) => new ethers.Contract(CrowdFundingAddress, CrowdFundingABI, signerOrProvider);

export const CrowdFundingContext = React.createContext();

export const CrowdFundingProvider = ({ children }) => {
  const titleDate = "Crowd Funding Contract";
  const [currentAccount, setCurrentAccount] = useState("");

  const createCampaign = async (campaign) => {
    const { title, description, amount, deadline } = campaign;
    const web3Modal = new Wenb3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    console.log(currentAccount);
    try {
      const transaction = await connection.createCampaign(
        currentAccount,
        title,
        description, 
        ethers.utils.parseUnits(amount, 18),
        new Date(deadline).getTime()
      );

      await transaction.wait();

      console.log("Contract Call Success", transaction);
    } catch (error) {
      console.log("Contract Call Failure", error);
      
    }
  };

  const getCampaigns = async () => {
    const provider = new JsonRpcProvider();
    const contract = fetchContract(provider);

    const campaigns = await contract.getCampaigns();

    const parsedCampaings = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
      pId: i
    }));

    return parsedCampaings;
  };

  const getUserCampaigns = async () => {
    const provider = new JsonRpcProvider();
    const contract = fetchContract(provider);

    const allCampaigns =  await contract.getCampaigns();

    const accounts = await window.ethereum.request({
      method: "eth_accounts"
    });
    const currentUser = accounts[0];

    const filteredCamapigns = allCampaigns.filter(
      (campaign) => campaign.owner === "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
    );

    const userData = filteredCamapigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
      pId: i
    }));

    return userData;
  };

  const donate = async (pId, amount) => {
    const web3Modal = new Wenb3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const campaignData = await contract.donateToCampaign(pId, {
      value: ethers.utils.parseEther(amount)
    });

    await campaignData.wait();
    location.reload();

    return campaignData;
  };

  const getDonations = async (pId) => {
    const provider = new JsonRpcProvider();
    const contract = fetchContract(provider);

    const donations = await contract.getDonators[pId];
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for(let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString())
      });
    }

    return parsedDonations;
  };

  // Check If Wallet Is Connected
  const checkIfWalletConnected = async () => {
    try {
      if (!window.ethereum)
        return setOpenError(true), setError("Install MetaMask");

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      } else {
        console.log("No Account Found");
      }
    } catch (error) {
      console.log("Something Went Wrong While Connecting To Wallet");
    }
  };

  useEffect(() => {
    checkIfWalletConnected();
  }, []);

  // Connect Wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum)
        return console.log("Install MetaMask");
      
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log("Error While Connecting To Wallet");
    }
  };

  return (
    <CrowdFundingContext.Provider
      value={{
        titleDate,
        currentAccount,
        createCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
        connectWallet
      }}
    >
      {children}
    </CrowdFundingContext.Provider>
  );
};