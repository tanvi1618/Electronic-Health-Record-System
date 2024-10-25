// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract HealthcareRecords {
    address owner;

    struct Record {
        uint256 recordID;
        string patientName;
        string diagnosis;
        string treatment;
        uint256 timestamp;
    }

    mapping(uint256 => Record[]) private patientRecords;
    mapping(address => bool) private authorizedProviders;

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this function");
        _;
    }

    modifier onlyAuthorizedProvider() {
        require(authorizedProviders[msg.sender], "Not an authorized provider");
        _;
    }

    // Constructor sets the contract owner
    constructor() public {
        owner = msg.sender;
    }

    // Function to get the owner of the contract
    function getOwner() public view returns (address) {
        return owner;
    }

    // Function to authorize a healthcare provider (only owner can do this)
    function authorizeProvider(address provider) public onlyOwner {
        authorizedProviders[provider] = true;
    }

    // Function to add a patient record (only authorized providers can do this)
    function addRecord(
        uint256 patientID,
        string memory patientName,
        string memory diagnosis,
        string memory treatment
    ) public onlyAuthorizedProvider {
        uint256 recordID = patientRecords[patientID].length + 1;
        patientRecords[patientID].push(
            Record(recordID, patientName, diagnosis, treatment, block.timestamp)
        );
    }

    // Function to retrieve patient records (only authorized providers can do this)
    function getPatientRecords(
        uint256 patientID
    ) public view returns (Record[] memory) {
        return patientRecords[patientID];
    }

    function getAuthorization(address acc) public view returns (bool) {
        return authorizedProviders[acc];
    }
}
