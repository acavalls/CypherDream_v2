pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Marketplace.sol";

contract TestMarketplace {
	address testAddress = 0x9F19f0D26b6ac73CEDB85a60CBc98395E075b087;

	function testOwnerIsMadeAdmin() public {
		Marketplace marketplace = Marketplace(DeployedAddresses.Marketplace());
		Assert.equal(marketplace.checkAdminStatus(msg.sender), true, "It should make the owner of the contract an administrator");
	}

	function testOtherAccountIsNotMadeAdmin() public {
		Marketplace marketplace = Marketplace(DeployedAddresses.Marketplace());
		Assert.equal(marketplace.checkAdminStatus(testAddress), false, "It should not make another address an administrator");
	}

	function testCanRequestStoreOwnerStatus() public {
		Marketplace marketplace = Marketplace(DeployedAddresses.Marketplace());
		marketplace.requestStoreOwner();
		Assert.equal(marketplace.getStoreOwnerRequestLength(), 1, "There should be one requested store ownership");
	}
}