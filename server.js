require('dotenv').config()
const app = require('./app')

const port = process.env.PORT || 9000
app.listen(port, () => console.log(`Server Listening at port: ${port}`))
