import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://data-storage123.firebaseio.com/'
});

export default instance;