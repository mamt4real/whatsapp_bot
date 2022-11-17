const express = require('express')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.send('hello whatsapp')
})

require('./routes')(app)

app.use('*', (req, res) => {
  res.status(404).send(`${req.originalUrl} Not Found`)
})

module.exports = app
