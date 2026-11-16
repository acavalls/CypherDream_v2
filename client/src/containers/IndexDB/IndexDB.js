import { Component } from 'react';
import axios from './../../axios-orders';

class IndexDB extends Component {

    state = {
        database: false,
        data: null
    }

    componentDidMount () {
        axios.get(".json")
            .then(response => {

                this.setState( {
                    database : true,
                    data : response.data
                })
            })
            .catch(error => {
                console.log(error)
            })
    }

    render () {
        return this.state.data;
    }
} 

export default IndexDB;