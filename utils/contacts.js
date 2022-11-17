const contacts = [
  {
    addresses: [
      {
        city: 'Nairobi',
        country: 'Kenya',
      },
    ],
    name: {
      first_name: 'Daggie',
      last_name: 'Blanqx',
    },
    org: {
      company: 'Mom-N-Pop Shop',
    },
    phones: [
      {
        phone: '+1 (555) 025-3483',
      },
      {
        phone: '+254712345678',
      },
    ],
  },
]

const getContact = () => {
  const i = Math.round(Math.random() * contacts.length)
  return contacts[i]
}

module.exports = {
  getContact,
}
