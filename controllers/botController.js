const whatsapp = require('../utils/whatsapp')
const { initializeCart } = require('./cart_handler')
const { SimpleButtonHandler, radioButtonHandler } = require('./buttonHandlers')

const getHandler = async (req, res, next) => {
  try {
    console.log('GET: someone is pinging')
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (
      mode &&
      token &&
      mode === 'subscribe' &&
      token === process.env.APP_VERIFY_TOKEN
    ) {
      res.status(200).send(challenge)
    } else {
      res.sendStatus(403)
    }
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
}

const postHandler = async (req, res, next) => {
  try {
    console.log('POST: someone is pinging')
    // console.log(req.body)
    const data = whatsapp.parseMessage(req.body)
    if (!data?.isMessage) {
      res.sendStatus(200)
    }

    const incomingMessage = data.message
    const recipientPhone = incomingMessage.from.phone // extract the phone number of sender
    const recipientName = incomingMessage.from.name
    const typeOfMsg = incomingMessage.type // extract the type of message (some are text, others are images, others are responses to buttons etc...)
    const message_id = incomingMessage.message_id // extract the message id

    await whatsapp.markMessageAsRead({ message_id })
    initializeCart(recipientPhone)

    if (typeOfMsg === 'text_message') {
      await whatsapp.sendSimpleButtons({
        message: `Hey ${recipientName}, \nYou are speaking to a chatbot.\nWhat do you want to do next?`,
        recipientPhone: recipientPhone,
        listOfButtons: [
          {
            title: 'View some products',
            id: 'see_categories',
          },
          {
            title: 'Speak to a human',
            id: 'speak_to_human',
          },
        ],
      })
    }

    if (typeOfMsg === 'simple_button_message') {
      let button_id = incomingMessage.button_reply.id
      const simpleButtonHandler = new SimpleButtonHandler(
        recipientName,
        recipientPhone,
        button_id
      )
      if (button_id === 'speak_to_human')
        await simpleButtonHandler.speakToHuman()
      else if (button_id === 'see_categories')
        await simpleButtonHandler.seeCategories()
      else if (button_id.startsWith('category_'))
        await simpleButtonHandler.categoryProducts(
          button_id.split('category_')[1]
        )
      else if (button_id.startsWith('add_to_cart_'))
        await simpleButtonHandler.addToCart(button_id.split('add_to_cart_')[1])
      else if (button_id === 'checkout') await simpleButtonHandler.checkout()
      else if (button_id === 'print_invoice')
        await simpleButtonHandler.printInvoice()
      console.log('Its message simple-button')
    }

    if (typeOfMsg === 'radio_button_message') {
      let selectionId = incomingMessage.list_reply.id // the customer clicked and submitted a radio button
      await radioButtonHandler(selectionId, recipientPhone)
    }

    res.status(200).json({ message: 'processed' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: 'error', message: error.message, error })
  }
}
module.exports = {
  getHandler,
  postHandler,
}
