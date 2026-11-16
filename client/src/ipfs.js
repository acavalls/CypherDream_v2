const IPFS = require('ipfs-http-client');
const IPFSCluster = require('ipfs-cluster-api');

const ipfs = new IPFS({
    //host: '209.250.245.197',
    host: '127.0.0.1',
    port: 5001,
    protocol: 'http'
});

const ipfsCluster = IPFSCluster('127.0.0.1',9094,{protocol: 'http'});                 
module.exports = { ipfs, ipfsCluster };
