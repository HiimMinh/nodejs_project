'use strict'

const mongoose = require('mongoose')
require('dotenv').config();

async function newConnection(uri){

    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }); 

        console.log('Connect successfully!!!');
    } catch (error) {
        console.log(error)
        console.log('Connect failure!!!')
    }

}

// make connection to DB 
const shopDEVConnection = newConnection(process.env.URI_MONGOD_SHOPDEV)
// const userConnection = newConnection(process.env.URI_MONGOD_USER)


module.exports = shopDEVConnection
