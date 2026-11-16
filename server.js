'use strict'

const express = require("express");
const bodyParser = require("body-parser");
const IPFSCluster = require('ipfs-cluster-api');
const ipfsCluster = IPFSCluster('127.0.0.1',9094,{protocol: 'http'}); 

const httpPort = parseInt(process.env.HTTP_PORT) || 3001;

const initHttpServer = (myHttpPort) => {
    const app = express();
    app.use(bodyParser.json());

    app.listen(myHttpPort, () => {
        console.log('Listening http on port: ' + myHttpPort);
    });

    app.post('/api', (req, res) => {
        console.log("HOLA!");
        ipfsCluster.pin.add("QmXjQFbrxkSaxjKQQtSVL24TpXtoK8JVkQ4E8347rY1AAU", (err) => {
            if (err) {
                console.log("ATPC");
                throw err
            };
        });
        res.setHeader('content-type', 'text/plain');
        res.send(JSON.stringify({ hola: "kk"}));

    });

};

initHttpServer(httpPort);
