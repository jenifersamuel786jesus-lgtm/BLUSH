const mongoose = require('mongoose');

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blush_and_glow';

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);

  return mongoose.connection;
}

module.exports = connectDatabase;
