pragma solidity ^0.4.24;

import "../installed_contracts/zeppelin/contracts/ownership/Ownable.sol";
import "../installed_contracts/zeppelin/contracts/lifecycle/Destructible.sol";
import "../installed_contracts/zeppelin/contracts/lifecycle/Pausable.sol";

contract Marketplace is Ownable, Destructible, Pausable {
    
    // Maps and arrays definition: Permissions.
    mapping (address => bool) private administrators;
    mapping (address => bool) private dataOwnerStatus;
    address[] private requestedDataOwnerStatus;

    // Maps and arrays definition: Marketplace.
    bytes32[] private registeredDatasetsId;
    mapping (address => bytes32[]) private datasetsByOwner;
    mapping (address => bytes32[]) private datasetsByBuyer;
    mapping (address => bool) private propietary;
    mapping (address => mapping (bytes32 => bool)) private rejected;
    mapping (address => mapping (bytes32 => bool)) private dataOwner;
    mapping (address => mapping (bytes32 => bool)) private allowWithdrawalbyDataPurchaser;
    mapping (address => mapping (bytes32 => bool)) private passwordSentbyDataOwner;
    mapping (address => mapping (bytes32 => string)) private encryptedIV;
    mapping (address => mapping (bytes32 => string)) private encryptedKey;
    mapping (address => mapping (bytes32 => address[])) private transactionsHistory;
    mapping (address => mapping (bytes32 => mapping ( address => bool) )) private transactionBalanceWithdraw;
    mapping (address => mapping (bytes32 => address)) private transactionsHistoryBuyer;
    mapping (address => mapping (bytes32 => mapping (address => Transaction))) private transactionStatus;
    mapping (address => mapping (bytes32 => mapping (address => speedBump))) private withdrawalCustodyOwner;
    mapping (address => mapping (bytes32 => mapping (address => speedBump))) private withdrawalCustodyBuyer;
    mapping (bytes32 => Dataset) private datasetById;
    mapping (address => mapping (bytes32 => bool)) private dataBuyer;
    mapping (address => string) private publicKeys; 
    mapping (address => bool) private publicKeyStatus;
    uint constant withdrawalWaitPeriod = 5 minutes;
    uint fees;

    // Constructor definition.
    constructor() public {
        administrators[msg.sender] = true;
        propietary[msg.sender] = true;
    }

    // Custom modifiers definition.
    modifier onlyAdmin() {
        require(administrators[msg.sender] == true);
        _;
    }

    modifier onlyDataOwnerStatus () {
        require(dataOwnerStatus[msg.sender] == true);
        _;
    }

    modifier onlyDataOwner (bytes32 id) {
        require(dataOwner[msg.sender][id] == true);
        _;
    }

    modifier onlyBuyer (bytes32 id) {
        require(dataBuyer[msg.sender][id] == true);
        _;
    }

    // Structs: 

    struct Dataset {
        bytes32 id;
        uint price;
    }

    struct Transaction {
        bytes32 id;
        address buyer;
        address owner;
        uint balance;
        bool purchased;
    }

    struct speedBump {
        uint time;
    }

    // STATE FUNCTIONS AND EVENTS.

    // EVENTS: PERMISSIONS.

    event AdminAdded (address AdminAddedAddress);
    event AdminRemoved (address AdminRemovedAddress);
    event DataOwnerStatusAdded (address DataOwnerStatusAddedAddress);
    event DataOwnerStatusRemoved (address DataOwnerStatusRemovedAddress);
    event DataOwnerStatusRequest (address DataOwnerStatusRequestAddress);
    event DataOwnerStatusRequestRemoved (uint DataOwnerStatusRequestsLength);

    // EVENTS: MARKETPLACE.

    event DatasetRegistered (bytes32 DatasetId);
    event WithdrawalAllowed (address DataBuyer, bytes32 DatasetId);
    event WithdrawalOwner (address Owner);
    event PasswordSent (address DataOwner, address DataBuyer);
    event PasswordDeleted (address DataBuyer, bytes32 DatasetId);
    event PurchasedDataset (address DataBuyer, bytes32 DatasetId);
    event PriceUpdated (bytes32 DatasetId, uint oldPrice, uint newPrice);
    event BalanceWithdrawn (address DataOwner, bytes32 DatasetId, uint balance);
    event BalanceRecovered(address DataBuyer, bytes32 DatasetId, uint balance);
    event DatasetRemoved (address DataOwner, bytes32 DatasetId);
    event PublicKeyRegistered (address DataBuyer);

    // FUNCTIONS: PERMISSIONS.

    function addAdmin (address admin)
    onlyAdmin
    whenNotPaused
    public {
        require(administrators[admin] == false);
        administrators[admin] = true;
        emit AdminAdded (admin);
    }

    function removeAdmin (address admin)
    onlyOwner
    whenNotPaused
    public {
        require(administrators[admin] == true);
        administrators[admin] = false;
        emit AdminRemoved (admin);
    }

    function addDataOwnerStatus (address owner, uint index)
    onlyAdmin
    whenNotPaused
    public {
        require(dataOwnerStatus[owner] == false);
        dataOwnerStatus[owner] = true;
        // Remove address from requests list 
        uint length = requestedDataOwnerStatus.length;
        requestedDataOwnerStatus[index] = requestedDataOwnerStatus[length-1];
        delete requestedDataOwnerStatus[length-1];
        requestedDataOwnerStatus.length--;
        emit DataOwnerStatusAdded (owner);
    }

    function removeDataOwnerStatus (address owner)
    onlyAdmin
    whenNotPaused
    public {
        require(dataOwnerStatus[owner] == true);
        require(datasetsByOwner[owner].length == 0);
        dataOwnerStatus[owner] = false;
        emit DataOwnerStatusRemoved (owner);
    }

    function requestDataOwnerStatus ()
    whenNotPaused
    public {
        require(dataOwnerStatus[msg.sender] == false);
        requestedDataOwnerStatus.push(msg.sender);
        emit DataOwnerStatusRequest(msg.sender);
    }

    function removeDataOwnerStatusRequest (uint index) 
    onlyAdmin
    whenNotPaused
    public {
        uint length = requestedDataOwnerStatus.length;
        requestedDataOwnerStatus[index] = requestedDataOwnerStatus[length-1];
        delete requestedDataOwnerStatus[length-1];
        requestedDataOwnerStatus.length--;
        emit DataOwnerStatusRequestRemoved(index);
    }

    // FUNCTIONS: MARKETPLACE.

    function registerDataset (bytes32 id, uint price)
    onlyDataOwnerStatus
    whenNotPaused
    public {
        require(dataOwner[msg.sender][id] != true);

        datasetsByOwner[msg.sender].push(id);
        registeredDatasetsId.push(id);
        dataOwner[msg.sender][id] = true;

        datasetById[id].id = id;
        datasetById[id].price = price;

        emit DatasetRegistered(id);
    }

    function passwordUpload (address buyer, bytes32 id, string IV, string key)
    onlyDataOwner(id)
    whenNotPaused
    public {
        require(passwordSentbyDataOwner[buyer][id] == false && rejected[buyer][id] == false );
        passwordSentbyDataOwner[buyer][id] = true;
        encryptedIV[buyer][id] = IV;
        encryptedKey[buyer][id] = key;
        withdrawalCustodyOwner[msg.sender][id][buyer].time = now;
        emit PasswordSent (msg.sender, buyer);
    }

    function rejectPassword (bytes32 id)
    onlyBuyer(id)
    whenNotPaused
    public {
        require(passwordSentbyDataOwner[msg.sender][id] == true);
        passwordSentbyDataOwner[msg.sender][id] = false;
        rejected[msg.sender][id] = true;
        delete encryptedIV[msg.sender][id];
        delete encryptedKey[msg.sender][id];
        emit PasswordDeleted (msg.sender, id);
    }

    function allowWithdrawal (bytes32 id)
    onlyBuyer(id)
    whenNotPaused
    public {
        require(passwordSentbyDataOwner[msg.sender][id] == true);
        allowWithdrawalbyDataPurchaser[msg.sender][id] = true;
        emit WithdrawalAllowed (msg.sender, id);
    }

    function ownerWithdrawal()
    onlyOwner
    whenNotPaused
    public {
        msg.sender.transfer(fees);
        fees = 0;
        emit WithdrawalOwner (msg.sender);
    }

    function purchaseDataset (bytes32 id, address owner)
    whenNotPaused
    payable
    public {
        require(msg.value >= datasetById[id].price);
        require(transactionStatus[owner][id][msg.sender].purchased != true);

        uint total = datasetById[id].price;
        if(msg.value > total) {
            uint refund = msg.value - total;
            msg.sender.transfer(refund);
        }

        // Transaction struct. 
        transactionStatus[owner][id][msg.sender].id = id;
        transactionStatus[owner][id][msg.sender].balance += total;
        transactionStatus[owner][id][msg.sender].purchased = true;
        transactionStatus[owner][id][msg.sender].buyer = msg.sender;
        transactionStatus[owner][id][msg.sender].owner = owner;

        // Transaction locator.
        transactionsHistory[owner][id].push(msg.sender);
        transactionsHistoryBuyer[msg.sender][id] = owner;

        // Password status: false.
        passwordSentbyDataOwner[msg.sender][id] = false;

        // Buyer has made the transfer.
        datasetsByBuyer[msg.sender].push(id);
        dataBuyer[msg.sender][id] = true;

        // Withdrawal is not allowed yet.
        allowWithdrawalbyDataPurchaser[msg.sender][id] = false;

        // Withdrawal Custody.
        withdrawalCustodyBuyer[owner][id][msg.sender].time = now;

        // Rejection status.
        rejected[msg.sender][id] = false;

        emit PurchasedDataset (msg.sender, id);
    }

    function updateDatasetPrice (bytes32 id, uint newPrice)
    onlyDataOwner(id)
    whenNotPaused
    public {
        uint oldPrice = datasetById[id].price;
        datasetById[id].price = newPrice;
        emit PriceUpdated(id, oldPrice, newPrice);
    }

    function withdrawTransactionBalance (address buyer, bytes32 id)
    onlyDataOwner(id)
    whenNotPaused
    public {
        require( ( (allowWithdrawalbyDataPurchaser[buyer][id] == true &&
                 transactionBalanceWithdraw[msg.sender][id][buyer] == false) ||
                 ( (now > withdrawalCustodyOwner[msg.sender][id][buyer].time + withdrawalWaitPeriod) &&
                 transactionBalanceWithdraw[msg.sender][id][buyer] == false) ) && 
                 rejected[buyer][id] == false );

        uint balances = transactionStatus[msg.sender][id][buyer].balance;
        uint rest = balances * 95 / 100; 
        uint feeValue = balances * 5 / 100; // 5% txFee
        fees += feeValue;
        allowWithdrawalbyDataPurchaser[buyer][id] = true;
        transactionStatus[msg.sender][id][buyer].balance = 0;
        transactionBalanceWithdraw[msg.sender][id][buyer] = true;
        msg.sender.transfer(rest);
        
        emit BalanceWithdrawn(msg.sender, id, balances);
    }

    function recoverTransactionBalance (address owner, bytes32 id)
    onlyBuyer(id)
    whenNotPaused
    public {
        require( (passwordSentbyDataOwner[msg.sender][id] == false) && 
                 (now > withdrawalCustodyBuyer[owner][id][msg.sender].time + withdrawalWaitPeriod) );
        
        // 1. MAKING THE RECOVERY TX:
        uint balances = transactionStatus[owner][id][msg.sender].balance;
        transactionStatus[owner][id][msg.sender].balance = 0;
        msg.sender.transfer(balances); 

        // 2. REVERTING THE PURCHASING DATASET STATE:

        // A. Delete entry from transactionsHistoryBuyer object:
        delete transactionsHistoryBuyer[msg.sender][id];

        // B. Change dataBuyer object state to FALSE:
        dataBuyer[msg.sender][id] = false;

        // C. Delete entry from transactionsHistory Array object:
        address[] memory transactionsHistoryList = transactionsHistory[owner][id];
        uint txCount = transactionsHistoryList.length;
        for(uint i=0; i < txCount; i++) {
            if(transactionsHistoryList[i] == msg.sender) {
                transactionsHistory[owner][id][i] = transactionsHistory[owner][id][txCount-1];
                delete transactionsHistory[owner][id][txCount-1];
                transactionsHistory[owner][id].length--;
                break;
            }
        }

        // D. Delete entry from datasetsByBuyer Array object:
        bytes32[] memory datasetsByBuyerList = datasetsByBuyer[msg.sender];
        txCount = datasetsByBuyerList.length;
        for(i=0; i < txCount; i++) {
            if(datasetsByBuyerList[i] == id) {
                datasetsByBuyer[msg.sender][i] = datasetsByBuyer[msg.sender][txCount-1];
                delete datasetsByBuyer[msg.sender][txCount-1];
                datasetsByBuyer[msg.sender].length--;
                break;
            }
        }

        // E. Delete entry from transactionStatus object:
        delete transactionStatus[owner][id][msg.sender];

        emit BalanceRecovered(msg.sender, id, balances);
    }

    function removeDataset (bytes32 id)
    onlyDataOwner(id)
    whenNotPaused
    public {
        require(dataOwner[msg.sender][id] == true);
        require(transactionsHistory[msg.sender][id].length == 0);

        // A. Remove dataset from registeredDatasets Array:
        bytes32[] memory dsList = registeredDatasetsId;
        for(uint i=0; i < dsList.length; i++){
            if(dsList[i] == id) {
                registeredDatasetsId[i] = registeredDatasetsId[dsList.length-1];
                delete registeredDatasetsId[dsList.length-1];
                registeredDatasetsId.length--;
        }}

        // B. Remove dataset from datasetsByOwner Map-Array:
        dsList = datasetsByOwner[msg.sender];
        for(i=0; i < dsList.length; i++){
            if(dsList[i] == id) {
                datasetsByOwner[msg.sender][i] = datasetsByOwner[msg.sender][dsList.length-1];
                delete datasetsByOwner[msg.sender][dsList.length-1];
                datasetsByOwner[msg.sender].length--;
        }

        // C. Change the DataOwner Status for the selected id:
        dataOwner[msg.sender][id] = false;

        // D. Remove Dataset info from datasetById STRUCT:
        delete datasetById[id];

        emit DatasetRemoved(msg.sender, id); 
        }
    }

    function registerPublicKey (address owner, bytes32 id, string publicKey)
    whenNotPaused
    public {
        require(transactionStatus[owner][id][msg.sender].purchased == true);
        require(publicKeyStatus[msg.sender] == false);
        publicKeys[msg.sender] = publicKey;
        publicKeyStatus[msg.sender] = true;

        emit PublicKeyRegistered(msg.sender);
    }

    // GETTERS FUNCTIONS.

    // FUNCTIONS: PERMISSIONS.

    function checkAdminStatus (address admin) 
    constant
    public 
    returns (bool) {
        return administrators[admin];
    }

    function checkDataOwnerStatus (address owner)
    constant
    public 
    returns (bool) {
        return dataOwnerStatus[owner];
    }

    function checkMKOwnerStatus (address MKOwner)
    constant
    public 
    returns (bool) {
        return propietary[MKOwner];
    }

    function getDataOwnerRequestStatus (uint index)
    constant
    public 
    returns (address) {
        return requestedDataOwnerStatus[index];
    }

    function getDataOwnerRequestStatusLength ()
    constant
    public 
    returns (uint) {
        return requestedDataOwnerStatus.length;
    }

    function getDataOwnerRequestStatusArray ()
    constant
    public
    returns (address[]) {
        return requestedDataOwnerStatus;
    }

    // FUNCTIONS: MARKETPLACE.

    function getTotalDatasetsCount ()
    constant
    public 
    returns (uint) {
        return registeredDatasetsId.length;
    }

    function getTotalDatasets ()
    constant
    public
    returns (bytes32[]) {
        return registeredDatasetsId;
    }

    function isDatasetOwner (address owner, bytes32 id)
    constant
    public
    returns (bool) {
        return dataOwner[owner][id];
    }

    function getOwnerDatasetsList (address owner)
    constant
    public
    returns (bytes32[]) {
        return datasetsByOwner[owner];
    }

    function getOwnerDatasetsCount (address owner)
    constant
    public
    returns (uint) {
        return datasetsByOwner[owner].length;
    }

    function getBuyerDatasetsList (address buyer)
    constant
    public
    returns (bytes32[]) {
        return datasetsByBuyer[buyer];
    }

    function getBuyerDatasetsCount (address buyer)
    constant
    public
    returns (uint) {
        return datasetsByBuyer[buyer].length;
    }

    function getPasswordUploadStatus (address buyer, bytes32 id)
    constant
    public
    returns (bool) {
        return passwordSentbyDataOwner[buyer][id];
    }
    
    function getEncryptedIV (address buyer, bytes32 id)
    constant
    public
    returns (string) {
        return encryptedIV[buyer][id];
    }

    function getEncryptedKey (address buyer, bytes32 id)
    constant
    public
    returns (string) {
        return encryptedKey[buyer][id];
    }

    function getWithdrawalStatus (address buyer, bytes32 id)
    constant
    public
    returns (bool) {
        return allowWithdrawalbyDataPurchaser[buyer][id];
    }

    function getTransactionWithdrawStatus (bytes32 id, address buyer, address owner) 
    constant
    public 
    returns (bool) {
        return transactionBalanceWithdraw[owner][id][buyer];
    }

    function getWithdrawalPeriod () 
    constant
    public 
    returns (uint) {
        return withdrawalWaitPeriod;
    }

    function getTime () 
    constant
    public 
    returns (uint) {
        return now;
    }

    function getWithdrawalCheckpointStartOwner (bytes32 id, address buyer, address owner) 
    constant
    public 
    returns (uint) {
        return withdrawalCustodyOwner[owner][id][buyer].time;
    }

    function getWithdrawalCheckpointStartBuyer (bytes32 id, address buyer, address owner) 
    constant
    public 
    returns (uint) {
        return withdrawalCustodyBuyer[owner][id][buyer].time;
    }


    function getTransactionBalance (bytes32 id, address buyer, address owner) 
    constant
    public 
    returns (uint) {
        return transactionStatus[owner][id][buyer].balance;
    }

    function getTransactionPurchaseStatus (bytes32 id, address buyer, address owner) 
    constant
    public 
    returns (bool) {
        return transactionStatus[owner][id][buyer].purchased;
    }

    function isDataBuyer (address buyer, bytes32 id)
    constant
    public 
    returns (bool) {
        return dataBuyer[buyer][id];
    }

    function getOwnerTransactionsHistory (bytes32 id, address owner) 
    constant
    public 
    returns (address[]) {
        return transactionsHistory[owner][id];
    } 

    function getBuyerTransactionsHistory (bytes32 id, address buyer) 
    constant
    public 
    returns (address) {
        return transactionsHistoryBuyer[buyer][id];
    } 

    function getDatasetPrice (bytes32 id)
    constant
    public
    returns (uint) {
        return datasetById[id].price;
    }

    function getDatasetInfo (bytes32 id)
    constant
    public
    returns (uint, bytes32) {
        return (datasetById[id].price,
                datasetById[id].id);
    }

    /*function getTransactionInfo (address buyer, address owner, bytes32 id)
    constant
    public
    returns (address, address , bytes32, uint, bool) {
        return (transactionStatus[owner][id][buyer].buyer,
                transactionStatus[owner][id][buyer].owner,
                transactionStatus[owner][id][buyer].id,
                transactionStatus[owner][id][buyer].balance,
                transactionStatus[owner][id][buyer].purchased);
    }*/

    function getBalance() 
    constant
    public 
    returns (uint) {
        return address(this).balance;
    }

    function getBalanceAccount(address acc)
    constant
    public
    returns (uint) {
        return address(acc).balance;
    } 

    function getPublicKey (address buyer)
    constant
    public 
    returns (string) {
        return publicKeys[buyer];
    }


}