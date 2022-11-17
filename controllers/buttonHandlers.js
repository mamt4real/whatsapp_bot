const { getContact } = require('../utils/contacts')
const whatsapp = require('../utils/whatsapp')
const store = require('../utils/store')
const { addToCart, listOfItemsInCart, clearCart } = require('./cart_handler')

/**
 * @param {String} recipientName
 *
 */
class SimpleButtonHandler {
  constructor(recipientName, recipientPhone) {
    this.recipientName = recipientName
    this.recipientPhone = recipientPhone
  }
  async speakToHuman() {
    await whatsapp.sendText({
      recipientPhone: this.recipientPhone,
      message: `Arguably, chatbots are faster than humans.\nCall my human with the below details:`,
    })

    await whatsapp.sendContact({
      recipientPhone: this.recipientPhone,
      contact_profile: getContact(),
    })
  }

  async seeCategories() {
    const categories = await store.getAllCategories()
    await whatsapp.sendSimpleButtons({
      message: `We have several categories.\nChoose one of them.`,
      recipientPhone: this.recipientPhone,
      listOfButtons: categories.data
        .map((category) => ({
          title: category,
          id: `category_${category}`,
        }))
        .slice(0, 3),
    })
  }
  async categoryProducts(selectedCategory) {
    const listOfProducts = await store.getProductsInCategory(selectedCategory)

    const listOfSections = [
      {
        title: `🏆 Top 3: ${selectedCategory}`.substring(0, 24),
        rows: listOfProducts.data
          .map((product) => {
            const id = `product_${product.id}`.substring(0, 256)
            const title = product.title.substring(0, 21)
            const description =
              `${product.price}\n${product.description}`.substring(0, 68)

            return {
              id,
              title: `${title}...`,
              description: `$${description}...`,
            }
          })
          .slice(0, 10),
      },
    ]

    await whatsapp.sendRadioButtons({
      recipientPhone: this.recipientPhone,
      headerText: `#BlackFriday Offers: ${selectedCategory}`,
      bodyText: `Our Santa 🎅🏿 has lined up some great products for you based on your previous shopping history.\n\nPlease select one of the products below:`,
      footerText: 'Powered by: BMI LLC',
      listOfSections,
    })
  }

  async addToCart(product_id) {
    await addToCart({ recipientPhone, product_id })
    const numberOfItemsInCart = listOfItemsInCart({
      recipientPhone: this.recipientPhone,
    }).count

    await whatsapp.sendSimpleButtons({
      message: `Your cart has been updated.\nNumber of items in cart: ${numberOfItemsInCart}.\n\nWhat do you want to do next?`,
      recipientPhone: this.recipientPhone,
      listOfButtons: [
        {
          title: 'Checkout 🛍️',
          id: `checkout`,
        },
        {
          title: 'See more products',
          id: 'see_categories',
        },
      ],
    })
  }
  async checkout() {
    const finalBill = listOfItemsInCart({ recipientPhone: this.recipientPhone })
    const invoiceText = `List of items in your cart:\n`

    finalBill.products.forEach((item, index) => {
      let serial = index + 1
      invoiceText += `\n#${serial}: ${item.title} @ $${item.price}`
    })

    invoiceText += `\n\nTotal: $${finalBill.total}`

    store.generatePDFInvoice({
      order_details: invoiceText,
      file_path: `./invoice_${this.recipientName}.pdf`,
    })

    await whatsapp.sendText({
      message: invoiceText,
      recipientPhone: this.recipientPhone,
    })

    await whatsapp.sendSimpleButtons({
      recipientPhone: this.recipientPhone,
      message: `Thank you for shopping with us, ${recipientName}.\n\nYour order has been received & will be processed shortly.`,
      listOfButtons: [
        {
          title: 'See more products',
          id: 'see_categories',
        },
        {
          title: 'Print my invoice',
          id: 'print_invoice',
        },
      ],
    })
    clearCart({ recipientPhone: this.recipientPhone })
  }
  async printInvoice() {
    // Send the PDF invoice
    await whatsapp.sendDocument({
      recipientPhone: this.recipientPhone,
      caption: `Mom-N-Pop Shop invoice #${this.recipientName}`,
      file_path: `./invoice_${this.recipientName}.pdf`,
    })

    // Send the location of our pickup station to the customer, so they can come and pick up their order
    const warehouse = store.generateRandomGeoLocation()

    await whatsapp.sendText({
      recipientPhone: this.recipientPhone,
      message: `Your order has been fulfilled. Come and pick it up, as you pay, here:`,
    })

    await whatsapp.sendLocation({
      recipientPhone: this.recipientPhone,
      latitude: warehouse.latitude,
      longitude: warehouse.longitude,
      address: warehouse.address,
      name: 'Mom-N-Pop Shop',
    })
  }
}

const radioButtonHandler = async (selectionId, recipientPhone) => {
  if (selectionId.startsWith('product_')) {
    let product_id = selectionId.split('_')[1]
    let product = await store.getProductById(product_id)
    const {
      price,
      title,
      description,
      category,
      image: imageUrl,
      rating,
    } = product.data

    let emojiRating = (rvalue) => '⭐'.repeat(Math.floor(rvalue || 0)) || 'N/A'
    let text = `_Title_: *${title.trim()}*\n\n
         _Description_: ${description.trim()}\n\n\n
          _Price_: $${price}
          _Category_: ${category}
          ${rating?.count || 0} shoppers liked this product.
          _Rated_: ${emojiRating(rating?.rate)}`

    await whatsapp.sendImage({
      recipientPhone,
      url: imageUrl,
      caption: text,
    })

    await whatsapp.sendSimpleButtons({
      message: `Here is the product, what do you want to do next?`,
      recipientPhone: recipientPhone,
      listOfButtons: [
        {
          title: 'Add to cart🛒',
          id: `add_to_cart_${product_id}`,
        },
        {
          title: 'Speak to a human',
          id: 'speak_to_human',
        },
        {
          title: 'See more products',
          id: 'see_categories',
        },
      ],
    })
  }
}

module.exports = { SimpleButtonHandler, radioButtonHandler }
