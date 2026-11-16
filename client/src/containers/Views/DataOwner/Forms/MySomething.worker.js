import CryptoJS from "crypto-js";

onmessage = async function (message) { // eslint-disable-line no-undef
    console.log('Message received from main script', message.data);
    //const workerResult = await myDoSomething(message.data);
    let iv = CryptoJS.lib.WordArray.random(128 / 8);
    let hexiv = iv.toString();
    console.log('Posting message back to main script');
    postMessage(hexiv);
}

// https://github.com/facebook/create-react-app/issues/1277