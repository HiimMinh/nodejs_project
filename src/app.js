const express = require('express')
const { default: helmet } = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const app = express()

// const db = require('./dbs/init.mongodb.lv0')

// init middlewares
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

// app.use(morgan('combined'))
// app.use(morgan('common'))
// app.use(morgan('short'))
// app.use(morgan('tiny'))

// init db
require('./dbs/init.mongodb')
const { countConnect,checkOverload } = require('./helpers/check.connect')
countConnect()
// checkOverload()
// require('./dbs/connections_multi_mongodb')
// const { countConnect } = require('./helpers/check.connect')
// countConnect()

// init routes
app.use('/', require('./routes'))

// handling error
app.use((req, res, next) => {
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    const statusCode = error.status || 500

    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error'
    })
})

module.exports = app