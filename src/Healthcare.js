import React, { useState, useEffect } from "react";
import Web3 from "web3";

const Healthcare = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [patientID, setPatientID] = useState("");
  const [patientName, setPatientName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [patientRecords, setPatientRecords] = useState([]);
  const [providerAddress, setProviderAddress] = useState("");
  const contractAddress = "0x7c4f5bDa50e93E74824Bd7Ab5706Fc4FC19dDf62";
  const contractABI = [
    {
      inputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      constant: true,
      inputs: [],
      name: "getOwner",
      outputs: [
        {
          name: "",
          type: "address",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        {
          name: "provider",
          type: "address",
        },
      ],
      name: "authorizeProvider",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        {
          name: "patientID",
          type: "uint256",
        },
        {
          name: "patientName",
          type: "string",
        },
        {
          name: "diagnosis",
          type: "string",
        },
        {
          name: "treatment",
          type: "string",
        },
      ],
      name: "addRecord",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        {
          name: "patientID",
          type: "uint256",
        },
      ],
      name: "getPatientRecords",
      outputs: [
        {
          components: [
            {
              name: "recordID",
              type: "uint256",
            },
            {
              name: "patientName",
              type: "string",
            },
            {
              name: "diagnosis",
              type: "string",
            },
            {
              name: "treatment",
              type: "string",
            },
            {
              name: "timestamp",
              type: "uint256",
            },
          ],
          name: "",
          type: "tuple[]",
        },
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [
        {
          name: "acc",
          type: "address",
        },
      ],
      name: "getAuthorization",
      outputs: [
        {
          name: "",
          type: "bool",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  ];

  useEffect(() => {
    const connectWallet = async () => {
      try {
        if (window.ethereum) {
          const web3Instance = new Web3(
            Web3.givenProvider || "ws://localhost:7545"
          );
          setWeb3(web3Instance);

          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setAccount(accounts[0]);

          const contractInstance = new web3Instance.eth.Contract(
            contractABI,
            contractAddress
          );
          setContract(contractInstance);

          const ownerAddress = await contractInstance.methods.getOwner().call();
          setIsOwner(accounts[0].toLowerCase() === ownerAddress.toLowerCase());

          // Logging for debugging
          console.log(`Connected account: ${accounts[0]}`);
          console.log(`Owner address: ${ownerAddress}`);
        } else {
          console.error("MetaMask is not installed!");
        }
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    };
    connectWallet();
  }, []);

  // Function to verify provider authorization
  const checkAuthorization = async () => {
    try {
      const isAuthorized = await contract.methods
        .getAuthorization(account)
        .call();
      if (!isAuthorized) {
        alert("You are not an authorized provider!");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking authorization:", error);
      return false;
    }
  };

  const fetchPatientRecords = async () => {
    const authorized = await checkAuthorization(); // Ensure provider is authorized
    // console.log("Is this authorized????", authorized);
    if (!authorized) {
      return;
    }
    try {
      const records = await contract.methods
        .getPatientRecords(patientID)
        .call();
      setPatientRecords(records);
    } catch (error) {
      console.error("Error fetching patient records:", error);
    }
  };

  const addRecord = async () => {
    const authorized = await checkAuthorization(); // Ensure provider is authorized
    if (!authorized) return;

    try {
      await contract.methods
        .addRecord(patientID, patientName, diagnosis, treatment)
        .send({ from: account });
      fetchPatientRecords();
      alert(`Record added successfully for patient: ${patientName}`);
    } catch (error) {
      console.error("Error adding record:", error);
    }
  };

  const authorizeProvider = async () => {
    if (isOwner) {
      try {
        await contract.methods
          .authorizeProvider(providerAddress)
          .send({ from: account });
        alert(`Provider ${providerAddress} authorized successfully`);
      } catch (error) {
        console.error("Error authorizing provider:", error);
      }
    } else {
      alert("Only the contract owner can authorize providers.");
    }
  };

  return (
    <div className="container">
      <h1 className="title">HealthCare Application</h1>
      {account && <p className="account-info">Connected Account: {account}</p>}
      {isOwner && <p className="owner-info">You are the contract owner</p>}

      <div className="form-section">
        <h2>Fetch Patient Records</h2>
        <input
          className="input-field"
          type="text"
          placeholder="Enter Patient ID"
          value={patientID}
          onChange={(e) => setPatientID(e.target.value)}
        />
        <button className="action-button" onClick={fetchPatientRecords}>
          Fetch Records
        </button>
      </div>

      <div className="form-section">
        <h2>Add Patient Record</h2>
        <input
          className="input-field"
          type="text"
          placeholder="Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)} // Capture patient name
        />
        <input
          className="input-field"
          type="number"
          placeholder="Patient ID"
          onChange={(e) => setPatientID(e.target.value)}
        />
        <input
          className="input-field"
          type="text"
          placeholder="Diagnosis"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />
        <input
          className="input-field"
          type="text"
          placeholder="Treatment"
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
        />
        <button className="action-button" onClick={addRecord}>
          Add Record
        </button>
      </div>

      <div className="form-section">
        <h2>Authorize HealthCare Provider</h2>
        <input
          className="input-field"
          type="text"
          placeholder="Provider Address"
          value={providerAddress}
          onChange={(e) => setProviderAddress(e.target.value)}
        />
        <button className="action-button" onClick={authorizeProvider}>
          Authorize Provider
        </button>
      </div>

      <div className="records-section">
        <h2>Patient Records</h2>
        {patientRecords.map((record, index) => (
          <div key={index}>
            <p>Record ID: {record.recordID}</p>
            <p>Patient ID: {patientID}</p>
            <p>Patient Name: {record.patientName}</p>
            <p>Diagnosis: {record.diagnosis}</p>
            <p>Treatment: {record.treatment}</p>
            <p>
              Timestamp: {new Date(record.timestamp * 1000).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Healthcare;
