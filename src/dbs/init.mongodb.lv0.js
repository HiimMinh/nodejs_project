// 'use strict'

// const mongoose = require('mongoose')

// // const connectSring = `mongdodb://127.0.0.1:27017/shopDEV`

// // mongoose.connect( connectSring).then( _ => console.log(`Connected Mongodb Success`)).catch( err => console.log(`Error Connect!`))
// async function connect(){
//     try {
//         await mongoose.connect('mongodb://127.0.0.1:27017/shopDEV', {
//             useNewUrlParser: true,
//             useUnifiedTopology: true
//         }); 

//         console.log('Connected Mongodb Success!!!');
//     } catch (error) {
//         console.log('Error Connect!')
//     }
// }

// // dev
// if(1 === 1){
//     mongoose.set('debug', true)
//     mongoose.set('debug', { color: true })
// }

// module.exports = {connect}