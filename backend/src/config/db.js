const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async (retries = 5) => {
  if (isConnected) return;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔌 MongoDB connection attempt ${attempt}/${retries}...`);
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 15000, // 15s — Atlas can be slow from some regions
        socketTimeoutMS: 45000,
      });
      isConnected = true;
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        const delay = attempt * 3000; // 3s, 6s, 9s, 12s, 15s
        console.log(`   ⏳ Retrying in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        console.error('💀 All MongoDB connection attempts failed. Exiting.');
        process.exit(1);
      }
    }
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('✅ MongoDB reconnected');
});

module.exports = connectDB;
