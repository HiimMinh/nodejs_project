const express = require('express')
const { default: helmet } = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const app = express()

// init middlewares
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())

// app.use(morgan('combined'))
// app.use(morgan('common'))
// app.use(morgan('short'))
// app.use(morgan('tiny'))
// init db

// init routes
app.get('/', (req, res, next) => {
    const strCompress = 'Hello Fantipjs'

    return res.status(500).json({
        message: 'Welcome Fantipjs',
        metadata: strCompress.repeat(10000)
    })
})

// handling error

module.exports = app