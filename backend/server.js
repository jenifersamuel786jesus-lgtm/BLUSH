require('dotenv').config();

const cors = require('cors');
const express = require('express');
const dns = require('dns');
dns.setServers(["8.8.8.8","1.1.1.1"]);
const connectDatabase = require('./config/db');
const Category = require('./models/Category');
const catalog = require('./data/catalog');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const subscriptionRoutes = require('./routes/subscriptions');


const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://127.0.0.1:4200',
  'http://localhost:4200'
];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.locals.dbConnected = false;

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'blush-and-glow-api',
    database: app.locals.dbConnected ? 'connected' : 'fallback'
  });
});

app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);


app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(500).json({ message: 'Something went wrong on the server' });
});

async function start() {
  try {
    await connectDatabase();
    app.locals.dbConnected = true;
    console.log('MongoDB connected');

    if (catalog.length) {
      const result = await Category.bulkWrite(
        catalog.map((category) => ({
          updateOne: {
            filter: { slug: category.slug },
            update: { $setOnInsert: category },
            upsert: true
          }
        }))
      );

      if (result.upsertedCount) {
        console.log(`Seeded ${result.upsertedCount} default categories into MongoDB`);
      }
    }
  } catch (error) {
    app.locals.mongoError = error?.message || String(error);
    console.warn(`MongoDB unavailable: ${app.locals.mongoError}`);
  } finally {
    app.listen(port, () => {
      console.log(`Blush & Glow API running on http://localhost:${port}`);
      if (!app.locals.dbConnected) {
        console.warn(`DB not connected. /api/* will return 503. Error: ${app.locals.mongoError}`);
      }
    });
  }
}

start();
