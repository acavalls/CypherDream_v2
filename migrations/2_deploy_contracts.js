// truffle migrate looks at the contracts folder and gets the contracts   
var Ownable = artifacts.require("Ownable");
var Destructible = artifacts.require("Destructible");
var Pausable = artifacts.require("Pausable");
var Marketplace = artifacts.require("Marketplace");

module.exports = function(deployer) {
  deployer.deploy(Ownable);
  deployer.link(Ownable, Destructible);
  deployer.link(Ownable, Pausable);
  deployer.deploy(Pausable);
  deployer.deploy(Destructible);
  deployer.deploy(Marketplace)
  deployer.link(Marketplace, Ownable);
  deployer.link(Marketplace, Destructible);
  deployer.link(Marketplace, Pausable);
};