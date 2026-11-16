var Marketplace = artifacts.require("Marketplace");
var Transaction = require('ethereumjs-tx');
var ethJsUtil = require('ethereumjs-util');
var BN = require("bn.js");

contract("Marketplace", async(accounts) => {
    
    /*it("Constructor: administrators hashmap -> Add Owner as an admin", async() => {
        let marketplaceInstance = await Marketplace.deployed();
        let check = await marketplaceInstance.checkAdminStatus(accounts[0]);
        assert.equal(check, true);
    });

    it("Constructor: administrators hashmap -> Other accounts aren't admins initially", async() => {
        let marketplaceInstance = await Marketplace.deployed();
        let check = await marketplaceInstance.checkAdminStatus(accounts[1]);
        assert.equal(check, false);
    });

    it("Admins: Add admin -> An admin is able to add new admins", async() => {
        let marketplaceInstance = await Marketplace.deployed();
        let admin = accounts[0];
        await marketplaceInstance.addAdmin(accounts[1], {from: admin});
        let check = await marketplaceInstance.checkAdminStatus(accounts[1]);
        assert.equal(check, true);
    });

    it("Not Admins: Add admin -> Anyone that isn't an admin is unable to add new admins", async() => {
        let marketplaceInstance = await Marketplace.deployed();
        let noAdmin = accounts[3];
        try {
            await marketplaceInstance.addAdmin(accounts[2], {from: noAdmin});
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert")
        }
    });

    it("Owner: Is able to remove an admin", async() => {
        let marketplaceInstance = await Marketplace.deployed();
        let admin = accounts[0];
        await marketplaceInstance.addAdmin(accounts[2], {from: admin});
        await marketplaceInstance.removeAdmin(accounts[2], {from: admin});
        let check = await marketplaceInstance.checkAdminStatus(accounts[2]);
        assert.equal(check, false);
    });

    it("Not Owner: Unable to remove an admin", async() => {
        let marketplaceInstance = await Marketplace.deployed();
        let noAdmin = accounts[2];

        try {
            await marketplaceInstance.removeAdmin(accounts[0], {from: noAdmin});
        } catch(err) {
            assert.equal(err.message, "VM Exception while processing transaction: revert")
        }
    });

    it("Anyone: Is able to request storeOwner status", async() => {
        let marketplaceInstance = await Marketplace.deployed();
        let noAdmin = accounts[1];
        await marketplaceInstance.requestStoreOwner({from: noAdmin});
        let len = await marketplaceInstance.getStoreOwnerRequestLength();
        let addreq = await marketplaceInstance.getStoreOwnerRequest(0);
        assert.equal(len, "1");
        assert.equal(addreq, accounts[1]);
    });

    it("Admin: Is able to approve request storeOwner status", async() => {
        let marketplaceInstance = await Marketplace.deployed();
        let admin = accounts[0];
        await marketplaceInstance.addStoreOwner(accounts[1], {from: admin});
        let check = await marketplaceInstance.checkStoreOwnerStatus(accounts[1]);
        assert.equal(check, true);
    });

    it("Admin: Is able to revoke storeOwner status", async() => {
        let marketplaceInstance = await Marketplace.deployed();
        let admin = accounts[0];
        await marketplaceInstance.removeStoreOwner(accounts[1], {from: admin});
        let check = await marketplaceInstance.checkStoreOwnerStatus(accounts[1]);
        assert.equal(check, false);
    });*/

    /*it("DataOwner: Is able to register a new dataset and it's properly registered", async() => {
        let marketplaceInstance = await Marketplace.deployed();
        let admin = accounts[0];
        let dataOwner = accounts[1];

        let length = await marketplaceInstance.getDataOwnerRequestStatusLength();
        assert.equal(length, 0);
        await marketplaceInstance.requestDataOwnerStatus({from: accounts[1]});
        length = await marketplaceInstance.getDataOwnerRequestStatusLength();
        assert.equal(length, 1);
        let check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
        assert.equal(check, false);
        await marketplaceInstance.addDataOwnerStatus(accounts[1], 0, {from: admin});
        check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
        assert.equal(check, true);
        let ipfsHash = "0x23b4173e17b1c9ceedcfb3f5ba733b0a79e1c6c74bd5bf91dd445e1c0d46aa4b";
        let check2 = await marketplaceInstance.getOwnerDatasetsCount(dataOwner);
        assert.equal(check2, 0);
        await marketplaceInstance.registerDataset( ipfsHash , {from: dataOwner});
        check2 = await marketplaceInstance.getOwnerDatasetsCount(dataOwner);
        assert.equal(check2, 1);

        ipfsHash = "0x23b4173e17b1c9ceedcfb3f5ba733b0a79e1c6c74bd5bf91dd445e1c0d46aa4b";
        await marketplaceInstance.registerDataset( ipfsHash , {from: dataOwner});
        let totalDScount = await marketplaceInstance.getTotalDatasetsCount();
        assert.equal(totalDScount, 2);
        let dsList = await marketplaceInstance.getTotalDatasets();
        console.log(dsList);
        let dsListOwner = await marketplaceInstance.getOwnerDatasetsList(dataOwner);
        console.log(dsListOwner);
        let dsOwnerCount = await marketplaceInstance.getOwnerDatasetsCount(dataOwner);
        assert.equal(dsOwnerCount, 2);
        let isOwner = await marketplaceInstance.isDatasetOwner(dataOwner, ipfsHash);
        assert.equal(isOwner, true); 
    });*/

    /*it("DataOwner & Buyer: Check if all the Marketplace functions are OK", async() => {
        let marketplaceInstance = await Marketplace.deployed();
        let admin = accounts[0];
        let dataOwner = accounts[1];
        let buyer = accounts[2];

        let length = await marketplaceInstance.getDataOwnerRequestStatusLength();
        assert.equal(length, 0);
        await marketplaceInstance.requestDataOwnerStatus({from: accounts[1]});
        length = await marketplaceInstance.getDataOwnerRequestStatusLength();
        assert.equal(length, 1);
        let check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
        assert.equal(check, false);
        await marketplaceInstance.addDataOwnerStatus(accounts[1], 0, {from: admin});
        check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
        assert.equal(check, true);

        let ipfsHash = "0x23b4173e17b1c9ceedcfb3f5ba733b0a79e1c6c74bd5bf91dd445e1c0d46aa4b";
        let price = web3.toWei(2);

        await marketplaceInstance.registerDataset( ipfsHash , price ,  {from: dataOwner});
        check2 = await marketplaceInstance.getOwnerDatasetsCount(dataOwner);
        assert.equal(check2, 1);

        check3 = await marketplaceInstance.getDatasetPrice(ipfsHash);
        assert.equal(check3.toNumber(), price);

        // ACCOUNT BALANCES CHECK AFTER PURCHASING PRODUCTS...
        let initialBalance = await marketplaceInstance.getBalanceAccount(buyer);

        let purchaseReceipt = await marketplaceInstance.purchaseDataset(ipfsHash, dataOwner, { from: buyer, value: price-100 });

        let gasUsed = purchaseReceipt.receipt.gasUsed;
        let TX = await web3.eth.getTransaction(purchaseReceipt.tx);
        let gasPrice = TX.gasPrice;
        let gasCost = gasPrice * gasUsed;

        let finalBalance = await marketplaceInstance.getBalanceAccount(buyer);

        assert.equal(finalBalance.toNumber(), initialBalance.toNumber()-gasCost-price*1);
        //


        check4 = await marketplaceInstance.getTransactionBalance(ipfsHash, buyer, dataOwner);
        assert.equal(check4.toNumber(), price);
        check5 = await marketplaceInstance.getPasswordUploadStatus(buyer, ipfsHash);
        assert.equal(check5, false);
        check6 = await marketplaceInstance.isDataBuyer(buyer, ipfsHash);
        assert.equal(check6, true);
        check7 = await marketplaceInstance.getWithdrawalStatus(buyer, ipfsHash);
        assert.equal(check7, false);
        await marketplaceInstance.passwordUpload(buyer, ipfsHash, { from : dataOwner } );
        check8 = await marketplaceInstance.getPasswordUploadStatus(buyer, ipfsHash);
        assert.equal(check8, true);
        await marketplaceInstance.allowWithdrawal(ipfsHash, { from : buyer });
        check9 = await marketplaceInstance.getWithdrawalStatus(buyer, ipfsHash);
        assert.equal(check9, true);
        check10 = await marketplaceInstance.getDatasetPrice(ipfsHash);
        assert.equal(check10.toNumber(), price);
        let newPrice = web3.toWei(3);
        await marketplaceInstance.updateDatasetPrice(ipfsHash, newPrice, { from : dataOwner });
        check11 = await marketplaceInstance.getDatasetPrice(ipfsHash);
        assert.equal(check11.toNumber(), newPrice);

        // ACCOUNT BALANCES CHECK AFTER WITHDRAW...

        initialBalance = await marketplaceInstance.getBalanceAccount(dataOwner);
        let withdrawReceipt = await marketplaceInstance.withdrawTransactionBalance(buyer, ipfsHash, { from : dataOwner });
        check12 = await marketplaceInstance.getTransactionBalance(ipfsHash, buyer, dataOwner);
        assert.equal(check12.toNumber(), 0);

        gasUsed = withdrawReceipt.receipt.gasUsed;
        TX = await web3.eth.getTransaction(withdrawReceipt.tx);
        gasPrice = TX.gasPrice;
        gasCost = gasPrice * gasUsed;

        finalBalance = await marketplaceInstance.getBalanceAccount(dataOwner);
        assert.equal(finalBalance.toNumber(), initialBalance.toNumber()-gasCost+price*1);
        //
        
    });*/

    /*it("DataOwner & Buyer: Check if all the Marketplace functions are OK", async () => {
        let marketplaceInstance = await Marketplace.deployed();
        let admin = accounts[0];
        let dataOwner = accounts[1];
        let buyer = accounts[2];

        let length = await marketplaceInstance.getDataOwnerRequestStatusLength();
        assert.equal(length, 0);
        await marketplaceInstance.requestDataOwnerStatus({ from: accounts[1] });
        length = await marketplaceInstance.getDataOwnerRequestStatusLength();
        assert.equal(length, 1);
        let check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
        assert.equal(check, false);
        await marketplaceInstance.addDataOwnerStatus(accounts[1], 0, { from: admin });
        check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
        assert.equal(check, true);

        let ipfsHash = "0x23b4173e17b1c9ceedcfb3f5ba733b0a79e1c6c74bd5bf91dd445e1c0d46aa4b";
        let ipfsHash2 = "0x23b4173e17b1c9ceedcfb3f5ba733b0a79e1c6c74bd5bf91dd445e173e17b1c9";
        let price = web3.toWei(2);
        let price2 = web3.toWei(4);

        await marketplaceInstance.registerDataset(ipfsHash, price, { from: dataOwner });
        await marketplaceInstance.registerDataset(ipfsHash2, price2, { from: dataOwner });
        check2 = await marketplaceInstance.getOwnerDatasetsCount(dataOwner);
        assert.equal(check2.toNumber(), 2);

        // Admin can't remove a dataOwner status if there are registered datasets.
        try {
            await marketplaceInstance.removeDataOwnerStatus(dataOwner, { from: admin });
            assert.fail('Should have reverted before');
          } catch(error) {
            assert.equal(error.message, "VM Exception while processing transaction: revert");
          }

        // Admin can't remove a dataOwner status if there is at least one registered dataset.
        await marketplaceInstance.removeDataset(ipfsHash, { from: dataOwner });
        let dsowner = await marketplaceInstance.getOwnerDatasetsCount(dataOwner);
        assert.equal(dsowner, 1);
        // Let's check if all data structures are updated.
        let totalDScount = await marketplaceInstance.getTotalDatasetsCount();
        assert.equal(totalDScount, 1);
        let isOwner = await marketplaceInstance.isDatasetOwner(dataOwner, ipfsHash);
        assert.equal(isOwner, false);

        try {
            await marketplaceInstance.removeDataOwnerStatus(dataOwner, { from: admin });
            assert.fail('Should have reverted before');
          } catch(error) {
            assert.equal(error.message, "VM Exception while processing transaction: revert");
          }

        // Admin can remove a dataOwner status if there are not registered datasets.
        isOwner = await marketplaceInstance.isDatasetOwner(dataOwner, ipfsHash2);
        assert.equal(isOwner, true);
        await marketplaceInstance.removeDataset(ipfsHash2, { from: dataOwner });
        // Let's check if all data structures are updated.
        dsowner = await marketplaceInstance.getOwnerDatasetsCount(dataOwner);
        assert.equal(dsowner, 0);
        totalDScount = await marketplaceInstance.getTotalDatasetsCount();
        assert.equal(totalDScount, 0);
        isOwner = await marketplaceInstance.isDatasetOwner(dataOwner, ipfsHash2);
        assert.equal(isOwner, false);

        // Remove dataOwner Status
        await marketplaceInstance.removeDataOwnerStatus(dataOwner, { from: admin });
        let dsownerStatus = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
        assert.equal(dsownerStatus, false);
    });*/

    /*it("DataOwner: Is able to withdraw the balance IF he have sent the pwd \
                   AND surpasses the withdrawalWaitPeriod EVEN IF the databuyer \
                   has not allowed the withdraw", async () => {

        let marketplaceInstance = await Marketplace.deployed();
        let admin = accounts[0];
        let dataOwner = accounts[1];
        let buyer = accounts[2];

        let length = await marketplaceInstance.getDataOwnerRequestStatusLength();
        assert.equal(length, 0);
        await marketplaceInstance.requestDataOwnerStatus({from: accounts[1]});
        length = await marketplaceInstance.getDataOwnerRequestStatusLength();
        assert.equal(length, 1);
        let check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
        assert.equal(check, false);
        await marketplaceInstance.addDataOwnerStatus(accounts[1], 0, {from: admin});
        check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
        assert.equal(check, true);

        let ipfsHash = "0x23b4173e17b1c9ceedcfb3f5ba733b0a79e1c6c74bd5bf91dd445e1c0d46aa4b";
        let price = web3.toWei(2);

        await marketplaceInstance.registerDataset( ipfsHash , price ,  {from: dataOwner});
        check2 = await marketplaceInstance.getOwnerDatasetsCount(dataOwner);
        assert.equal(check2, 1);

        check3 = await marketplaceInstance.getDatasetPrice(ipfsHash);
        assert.equal(check3.toNumber(), price);

        // ACCOUNT BALANCES CHECK AFTER PURCHASING PRODUCTS...
        let initialBalance = await marketplaceInstance.getBalanceAccount(buyer);

        let purchaseReceipt = await marketplaceInstance.purchaseDataset(ipfsHash, dataOwner, { from: buyer, value: price-100 });

        let gasUsed = purchaseReceipt.receipt.gasUsed;
        let TX = await web3.eth.getTransaction(purchaseReceipt.tx);
        let gasPrice = TX.gasPrice;
        let gasCost = gasPrice * gasUsed;

        let finalBalance = await marketplaceInstance.getBalanceAccount(buyer);

        assert.equal(finalBalance.toNumber(), initialBalance.toNumber()-gasCost-price*1);
        //

        check4 = await marketplaceInstance.getTransactionBalance(ipfsHash, buyer, dataOwner);
        assert.equal(check4.toNumber(), price);
        check5 = await marketplaceInstance.getPasswordUploadStatus(buyer, ipfsHash);
        assert.equal(check5, false);
        check6 = await marketplaceInstance.isDataBuyer(buyer, ipfsHash);
        assert.equal(check6, true);
        check7 = await marketplaceInstance.getWithdrawalStatus(buyer, ipfsHash);
        assert.equal(check7, false);
        await marketplaceInstance.passwordUpload(buyer, ipfsHash, { from : dataOwner } );
        check8 = await marketplaceInstance.getPasswordUploadStatus(buyer, ipfsHash);
        assert.equal(check8, true);
        check10 = await marketplaceInstance.getDatasetPrice(ipfsHash);
        assert.equal(check10.toNumber(), price);

        // ACCOUNT BALANCES CHECK AFTER WITHDRAW...

        function timeout(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    
        await timeout(11000); // withdrawalWaitPeriod = 10 seconds

        initialBalance = await marketplaceInstance.getBalanceAccount(dataOwner);
        let withdrawReceipt = await marketplaceInstance.withdrawTransactionBalance(buyer, ipfsHash, { from: dataOwner });
        check12 = await marketplaceInstance.getTransactionBalance(ipfsHash, buyer, dataOwner);
        assert.equal(check12.toNumber(), 0);

        gasUsed = withdrawReceipt.receipt.gasUsed;
        TX = await web3.eth.getTransaction(withdrawReceipt.tx);
        gasPrice = TX.gasPrice;
        gasCost = gasPrice * gasUsed;

        finalBalance = await marketplaceInstance.getBalanceAccount(dataOwner);
        assert.equal(finalBalance.toNumber(), initialBalance.toNumber() - gasCost + price * 1);

    });*/

    /*it("DataOwner: Is NOT able to withdraw the balance IF he have sent the pwd \
                   AND NOT surpasses the withdrawalWaitPeriod AND the databuyer \
                   has not allowed the withdraw", async () => {

        let marketplaceInstance = await Marketplace.deployed();
        let admin = accounts[0];
        let dataOwner = accounts[1];
        let buyer = accounts[2];

        let length = await marketplaceInstance.getDataOwnerRequestStatusLength();
        assert.equal(length, 0);
        await marketplaceInstance.requestDataOwnerStatus({from: accounts[1]});
        length = await marketplaceInstance.getDataOwnerRequestStatusLength();
        assert.equal(length, 1);
        let check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
        assert.equal(check, false);
        await marketplaceInstance.addDataOwnerStatus(accounts[1], 0, {from: admin});
        check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
        assert.equal(check, true);

        let ipfsHash = "0x23b4173e17b1c9ceedcfb3f5ba733b0a79e1c6c74bd5bf91dd445e1c0d46aa4b";
        let price = web3.toWei(2);

        await marketplaceInstance.registerDataset( ipfsHash , price ,  {from: dataOwner});
        check2 = await marketplaceInstance.getOwnerDatasetsCount(dataOwner);
        assert.equal(check2, 1);

        check3 = await marketplaceInstance.getDatasetPrice(ipfsHash);
        assert.equal(check3.toNumber(), price);

        // ACCOUNT BALANCES CHECK AFTER PURCHASING PRODUCTS...
        let initialBalance = await marketplaceInstance.getBalanceAccount(buyer);

        let purchaseReceipt = await marketplaceInstance.purchaseDataset(ipfsHash, dataOwner, { from: buyer, value: price-100 });

        let gasUsed = purchaseReceipt.receipt.gasUsed;
        let TX = await web3.eth.getTransaction(purchaseReceipt.tx);
        let gasPrice = TX.gasPrice;
        let gasCost = gasPrice * gasUsed;

        let finalBalance = await marketplaceInstance.getBalanceAccount(buyer);

        assert.equal(finalBalance.toNumber(), initialBalance.toNumber()-gasCost-price*1);
        //

        check4 = await marketplaceInstance.getTransactionBalance(ipfsHash, buyer, dataOwner);
        assert.equal(check4.toNumber(), price);
        check5 = await marketplaceInstance.getPasswordUploadStatus(buyer, ipfsHash);
        assert.equal(check5, false);
        check6 = await marketplaceInstance.isDataBuyer(buyer, ipfsHash);
        assert.equal(check6, true);
        check7 = await marketplaceInstance.getWithdrawalStatus(buyer, ipfsHash);
        assert.equal(check7, false);
        await marketplaceInstance.passwordUpload(buyer, ipfsHash, { from : dataOwner } );
        check8 = await marketplaceInstance.getPasswordUploadStatus(buyer, ipfsHash);
        assert.equal(check8, true);
        check10 = await marketplaceInstance.getDatasetPrice(ipfsHash);
        assert.equal(check10.toNumber(), price);

        // ACCOUNT BALANCES CHECK AFTER WITHDRAW...

        function timeout(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    
        await timeout(5000); // withdrawalWaitPeriod = 10 seconds

        initialBalance = await marketplaceInstance.getBalanceAccount(dataOwner);

        try {
            await marketplaceInstance.withdrawTransactionBalance(buyer, ipfsHash, { from: dataOwner });
            assert.fail('Should have reverted before');
          } catch(error) {
            assert.equal(error.message, "VM Exception while processing transaction: revert");
          }
    });*/

    /*it("DataBuyer: Is able to recover the balance IF the DataOwner has not sent \
                     the pwd AND has surpassed the withdrawalWaitPeriod " , async () => {

            let marketplaceInstance = await Marketplace.deployed();
            let admin = accounts[0];
            let dataOwner = accounts[1];
            let buyer = accounts[2];

            let length = await marketplaceInstance.getDataOwnerRequestStatusLength();
            assert.equal(length, 0);
            await marketplaceInstance.requestDataOwnerStatus({ from: accounts[1] });
            length = await marketplaceInstance.getDataOwnerRequestStatusLength();
            assert.equal(length, 1);
            let check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
            assert.equal(check, false);
            await marketplaceInstance.addDataOwnerStatus(accounts[1], 0, { from: admin });
            check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
            assert.equal(check, true);

            let ipfsHash = "0x23b4173e17b1c9ceedcfb3f5ba733b0a79e1c6c74bd5bf91dd445e1c0d46aa4b";
            let price = web3.toWei(2);

            await marketplaceInstance.registerDataset(ipfsHash, price, { from: dataOwner });
            check2 = await marketplaceInstance.getOwnerDatasetsCount(dataOwner);
            assert.equal(check2, 1);

            check3 = await marketplaceInstance.getDatasetPrice(ipfsHash);
            assert.equal(check3.toNumber(), price);

            // ACCOUNT BALANCES CHECK AFTER PURCHASING PRODUCTS...
            let initialBalance = await marketplaceInstance.getBalanceAccount(buyer);

            let purchaseReceipt = await marketplaceInstance.purchaseDataset(ipfsHash, dataOwner, { from: buyer, value: price - 100 });

            let gasUsed = purchaseReceipt.receipt.gasUsed;
            let TX = await web3.eth.getTransaction(purchaseReceipt.tx);
            let gasPrice = TX.gasPrice;
            let gasCost = gasPrice * gasUsed;

            let finalBalance = await marketplaceInstance.getBalanceAccount(buyer);

            assert.equal(finalBalance.toNumber(), initialBalance.toNumber() - gasCost - price * 1);
            //

            check4 = await marketplaceInstance.getTransactionBalance(ipfsHash, buyer, dataOwner);
            assert.equal(check4.toNumber(), price);
            check5 = await marketplaceInstance.getPasswordUploadStatus(buyer, ipfsHash);
            assert.equal(check5, false);
            check6 = await marketplaceInstance.isDataBuyer(buyer, ipfsHash);
            assert.equal(check6, true);
            check7 = await marketplaceInstance.getWithdrawalStatus(buyer, ipfsHash);
            assert.equal(check7, false);
            check10 = await marketplaceInstance.getDatasetPrice(ipfsHash);
            assert.equal(check10.toNumber(), price);

            // ACCOUNT BALANCES CHECK AFTER WITHDRAW...

            function timeout(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            await timeout(12000); // withdrawalWaitPeriod = 10 seconds

            initialBalance = await marketplaceInstance.getBalanceAccount(buyer);
            let recoveryReceipt = await marketplaceInstance.recoverTransactionBalance(dataOwner, ipfsHash, { from: buyer });
            check12 = await marketplaceInstance.getTransactionBalance(ipfsHash, buyer, dataOwner);
            assert.equal(check12.toNumber(), 0);
    
            gasUsed = recoveryReceipt.receipt.gasUsed;
            TX = await web3.eth.getTransaction(recoveryReceipt.tx);
            gasPrice = TX.gasPrice;
            gasCost = gasPrice * gasUsed;
    
            finalBalance = await marketplaceInstance.getBalanceAccount(buyer);
            assert.equal(finalBalance.toNumber(), initialBalance.toNumber() - gasCost + price * 1);
        });*/

    /*it("DataBuyer: Is NOT able to recover the balance IF the DataOwner has not sent \
                     the pwd AND has NOT surpassed the withdrawalWaitPeriod " , async () => {

            let marketplaceInstance = await Marketplace.deployed();
            let admin = accounts[0];
            let dataOwner = accounts[1];
            let buyer = accounts[2];

            let length = await marketplaceInstance.getDataOwnerRequestStatusLength();
            assert.equal(length, 0);
            await marketplaceInstance.requestDataOwnerStatus({ from: accounts[1] });
            length = await marketplaceInstance.getDataOwnerRequestStatusLength();
            assert.equal(length, 1);
            let check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
            assert.equal(check, false);
            await marketplaceInstance.addDataOwnerStatus(accounts[1], 0, { from: admin });
            check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
            assert.equal(check, true);

            let ipfsHash = "0x23b4173e17b1c9ceedcfb3f5ba733b0a79e1c6c74bd5bf91dd445e1c0d46aa4b";
            let price = web3.toWei(2);

            await marketplaceInstance.registerDataset(ipfsHash, price, { from: dataOwner });
            check2 = await marketplaceInstance.getOwnerDatasetsCount(dataOwner);
            assert.equal(check2, 1);

            check3 = await marketplaceInstance.getDatasetPrice(ipfsHash);
            assert.equal(check3.toNumber(), price);

            // ACCOUNT BALANCES CHECK AFTER PURCHASING PRODUCTS...
            let initialBalance = await marketplaceInstance.getBalanceAccount(buyer);

            let purchaseReceipt = await marketplaceInstance.purchaseDataset(ipfsHash, dataOwner, { from: buyer, value: price - 100 });

            let gasUsed = purchaseReceipt.receipt.gasUsed;
            let TX = await web3.eth.getTransaction(purchaseReceipt.tx);
            let gasPrice = TX.gasPrice;
            let gasCost = gasPrice * gasUsed;

            let finalBalance = await marketplaceInstance.getBalanceAccount(buyer);

            assert.equal(finalBalance.toNumber(), initialBalance.toNumber() - gasCost - price * 1);
            //

            check4 = await marketplaceInstance.getTransactionBalance(ipfsHash, buyer, dataOwner);
            assert.equal(check4.toNumber(), price);
            check5 = await marketplaceInstance.getPasswordUploadStatus(buyer, ipfsHash);
            assert.equal(check5, false);
            check6 = await marketplaceInstance.isDataBuyer(buyer, ipfsHash);
            assert.equal(check6, true);
            check7 = await marketplaceInstance.getWithdrawalStatus(buyer, ipfsHash);
            assert.equal(check7, false);
            check10 = await marketplaceInstance.getDatasetPrice(ipfsHash);
            assert.equal(check10.toNumber(), price);

            // ACCOUNT BALANCES CHECK AFTER WITHDRAW...

            function timeout(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            await timeout(5000); // withdrawalWaitPeriod = 10 seconds

            initialBalance = await marketplaceInstance.getBalanceAccount(buyer);

            try {
                await marketplaceInstance.recoverTransactionBalance(dataOwner, ipfsHash, { from: buyer });
                assert.fail('Should have reverted before');
              } catch(error) {
                assert.equal(error.message, "VM Exception while processing transaction: revert");
              }
        });*/

    /*it("DataBuyer: Is NOT able to recover the balance IF the DataOwner has sent \
        the pwd EVEN IF has surpassed the withdrawalWaitPeriod " , async () => {
            let marketplaceInstance = await Marketplace.deployed();
            let admin = accounts[0];
            let dataOwner = accounts[1];
            let buyer = accounts[2];

            let length = await marketplaceInstance.getDataOwnerRequestStatusLength();
            assert.equal(length, 0);
            await marketplaceInstance.requestDataOwnerStatus({ from: accounts[1] });
            length = await marketplaceInstance.getDataOwnerRequestStatusLength();
            assert.equal(length, 1);
            let check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
            assert.equal(check, false);
            await marketplaceInstance.addDataOwnerStatus(accounts[1], 0, { from: admin });
            check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
            assert.equal(check, true);

            let ipfsHash = "0x23b4173e17b1c9ceedcfb3f5ba733b0a79e1c6c74bd5bf91dd445e1c0d46aa4b";
            let price = web3.toWei(2);

            await marketplaceInstance.registerDataset(ipfsHash, price, { from: dataOwner });
            check2 = await marketplaceInstance.getOwnerDatasetsCount(dataOwner);
            assert.equal(check2, 1);

            check3 = await marketplaceInstance.getDatasetPrice(ipfsHash);
            assert.equal(check3.toNumber(), price);

            // ACCOUNT BALANCES CHECK AFTER PURCHASING PRODUCTS...
            let initialBalance = await marketplaceInstance.getBalanceAccount(buyer);

            let purchaseReceipt = await marketplaceInstance.purchaseDataset(ipfsHash, dataOwner, { from: buyer, value: price - 100 });

            let gasUsed = purchaseReceipt.receipt.gasUsed;
            let TX = await web3.eth.getTransaction(purchaseReceipt.tx);
            let gasPrice = TX.gasPrice;
            let gasCost = gasPrice * gasUsed;

            let finalBalance = await marketplaceInstance.getBalanceAccount(buyer);

            assert.equal(finalBalance.toNumber(), initialBalance.toNumber() - gasCost - price * 1);
            //

            check4 = await marketplaceInstance.getTransactionBalance(ipfsHash, buyer, dataOwner);
            assert.equal(check4.toNumber(), price);
            check5 = await marketplaceInstance.getPasswordUploadStatus(buyer, ipfsHash);
            assert.equal(check5, false);
            check6 = await marketplaceInstance.isDataBuyer(buyer, ipfsHash);
            assert.equal(check6, true);
            check7 = await marketplaceInstance.getWithdrawalStatus(buyer, ipfsHash);
            assert.equal(check7, false);
            check10 = await marketplaceInstance.getDatasetPrice(ipfsHash);
            assert.equal(check10.toNumber(), price);
            await marketplaceInstance.passwordUpload(buyer, ipfsHash, { from : dataOwner } );
            check8 = await marketplaceInstance.getPasswordUploadStatus(buyer, ipfsHash);
            assert.equal(check8, true);

            // ACCOUNT BALANCES CHECK AFTER WITHDRAW...

            function timeout(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            await timeout(12000); // withdrawalWaitPeriod = 10 seconds

            initialBalance = await marketplaceInstance.getBalanceAccount(buyer);

            try {
                await marketplaceInstance.recoverTransactionBalance(dataOwner, ipfsHash, { from: buyer });
                assert.fail('Should have reverted before');
              } catch(error) {
                assert.equal(error.message, "VM Exception while processing transaction: revert");
              }
        });*/

        /*it("DataBuyer: Is able to register his PublicKey" , async () => {
            let marketplaceInstance = await Marketplace.deployed();
            let admin = accounts[0];
            let dataOwner = accounts[1];
            let buyer = accounts[2];


            let length = await marketplaceInstance.getDataOwnerRequestStatusLength();
            assert.equal(length, 0);
            await marketplaceInstance.requestDataOwnerStatus({ from: accounts[1] });
            length = await marketplaceInstance.getDataOwnerRequestStatusLength();
            assert.equal(length, 1);
            let check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
            assert.equal(check, false);
            await marketplaceInstance.addDataOwnerStatus(accounts[1], 0, { from: admin });
            check = await marketplaceInstance.checkDataOwnerStatus(dataOwner);
            assert.equal(check, true);

            let ipfsHash = "0x23b4173e17b1c9ceedcfb3f5ba733b0a79e1c6c74bd5bf91dd445e1c0d46aa4b";
            let price = web3.toWei(2);

            await marketplaceInstance.registerDataset(ipfsHash, price, { from: dataOwner });
            check2 = await marketplaceInstance.getOwnerDatasetsCount(dataOwner);
            assert.equal(check2, 1);

            check3 = await marketplaceInstance.getDatasetPrice(ipfsHash);
            assert.equal(check3.toNumber(), price);

            // ACCOUNT BALANCES CHECK AFTER PURCHASING PRODUCTS...

            let receipt = await marketplaceInstance.purchaseDataset(ipfsHash, dataOwner, { from: buyer, value: price });
            let tx = await web3.eth.getTransaction(receipt.tx);

            /*const txDetails = new Transaction({
                nonce: tx.nonce,
                gasPrice: ethJsUtil.bufferToHex(Buffer(tx.gasPrice)),
                gasLimit: tx.gas,
                to: tx.to,
                value: ethJsUtil.bufferToHex(Buffer(tx.value)),
                data: tx.input,
                chainId: web3.version.network,
                r: tx.r,
                s: tx.s,
                v: tx.v,
            });
    
            const pubkey = txDetails.getSenderPublicKey();
            console.log("txDetails.getSenderAddress", txDetails.getSenderAddress().toString('hex'));
            console.log("Pubkey to address", ethJsUtil.bufferToHex(ethJsUtil.pubToAddress(pubkey)));
            console.log(pubkey);

        });*/
});


