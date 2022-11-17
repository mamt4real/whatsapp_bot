const CustomerSession = new Map()
const store = require('../utils/store')

// Start of cart logic

const initializeCart = (recipientPhone) => {
  if (!CustomerSession.get(recipientPhone)) {
    CustomerSession.set(recipientPhone, {
      cart: [],
    })
  }
}

const addToCart = async ({ product_id, recipientPhone }) => {
  const product = await store.getProductById(product_id)
  if (product.status === 'success') {
    CustomerSession.get(recipientPhone).cart.push(product.data)
  }
}

const listOfItemsInCart = ({ recipientPhone }) => {
  let total = 0
  const products = CustomerSession.get(recipientPhone).cart
  total = products.reduce((acc, product) => acc + product.price, total)
  const count = products.length
  return { total, products, count }
}

const clearCart = ({ recipientPhone }) => {
  CustomerSession.get(recipientPhone).cart = []
}

module.exports = {
  clearCart,
  addToCart,
  listOfItemsInCart,
  initializeCart,
}
