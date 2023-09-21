'use strict'

const mongoose = require("mongoose");
require('dotenv').config();
const countConnect = require('../helpers/check.connect')
const mongooseToObject = require('../utils/mongoose')

class Database {
  constructor() {
    this.connect();
  }

  // connect
  connect(type = 'mongodb'){
    // dev
      if (1 === 1) {
        mongoose.set('debug', true);
        mongoose.set('debug', { color: true });
      }

      mongoose.connect( process.env.URI_MONGOD_SHOPDEV, {
        //???? PoolSize
        maxPoolSize: 50
      }).then( _ => console.log(`Connected Mongodb Success PRO :::: `)).catch( err => {
        console.log(`Error Connect!`)
        console.log('err::::', err);
      })
  }

  static getInstance() {
    if(!Database.instance){
        Database.instance = new Database() 
    }

    return Database.instance
  }
}

const instanceMonggodb = Database.getInstance()
module.exports = instanceMonggodb
