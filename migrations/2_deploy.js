var HealthcareRecords = artifacts.require("HealthcareRecords");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(HealthcareRecords);
};