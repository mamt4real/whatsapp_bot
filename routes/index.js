const { Router } = require('express')
const { getHandler, postHandler } = require('../controllers/botController')

const botRouter = Router()

botRouter.route('/').get(getHandler).post(postHandler)

module.exports = (app) => {
  app.use('/webhook', botRouter)
}
