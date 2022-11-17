const WhatsappCloudAPI = require('whatsappcloudapi_wrapper')

const Whatsapp = new WhatsappCloudAPI({
  accessToken: process.env.APP_ACCESS_TOKEN,
  senderPhoneNumberId: process.env.APP_SENDER_PHONE_ID,
  WABA_ID: process.env.APP_BUSINESS_ID,
})

module.exports = Whatsapp
