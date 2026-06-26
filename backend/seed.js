require('dotenv').config();

const connectDatabase = require('./config/db');
const Category = require('./models/Category');
const Order = require('./models/Order');
const Subscription = require('./models/Subscription');
const catalog = require('./data/catalog');

function generateDeliveryWindow() {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);

  const date = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(deliveryDate);

  return `${date}, 10:00 AM - 2:00 PM`;
}

async function seed() {
  const connection = await connectDatabase();

  // Categories (existing behavior)
  await Category.deleteMany({});
  await Category.insertMany(catalog);
  console.log(`Seeded ${catalog.length} categories into ${connection.name}`);

  // Orders (optional)
  if (process.env.SEED_ORDERS === 'true') {
    await Order.deleteMany({});

    const orders = [
      {
        orderNumber: `BG-${Date.now().toString().slice(-6)}`,
        details: {
          name: 'Demo User',
          address: '12 Glow Street, Bengaluru',
          email: 'demo.user@example.com',
          phone: '9999999999'
        },
        items: [
          {
            product: {
              name: 'Blush',
              price: 'Rs. 350',
              image: 'https://marscosmetics.in/cdn/shop/files/WEBSITEcopy_3_63f61e48-abbe-4e4d-97b8-286d354f9dbf.jpg?v=1773313383&width=800'
            },
            quantity: 1
          }
        ],
        total: 350,
        deliveryWindow: generateDeliveryWindow()
      }
    ];

    await Order.insertMany(orders);
    console.log(`Seeded ${orders.length} orders into ${connection.name}`);
  }

  // Subscriptions (optional)
  if (process.env.SEED_SUBSCRIPTIONS === 'true') {
    await Subscription.deleteMany({});

    const subscriptions = [
      { email: 'subscriber1@example.com' },
      { email: 'subscriber2@example.com' }
    ];

    await Subscription.insertMany(subscriptions);
    console.log(`Seeded ${subscriptions.length} subscriptions into ${connection.name}`);
  }

  await connection.close();
}

module.exports = seed;

// CLI usage: `node seed.js`
if (require.main === module) {
  seed().catch((error) => {
    console.error('Seed failed:', error.message);
    process.exit(1);
  });
}


