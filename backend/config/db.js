const mongoose = require('mongoose');

const connectDB = async () => {
  // If already connected, skip
  if (mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGODB_URI;

  // Try MongoDB Atlas first
  if (uri && uri.startsWith('mongodb')) {
    try {
      console.log('Connexion à MongoDB Atlas...');
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      console.log('MongoDB Atlas connecté:', mongoose.connection.host);
      return;
    } catch (err) {
      console.warn('Atlas indisponible:', err.message);
      console.log('Basculement vers MongoDB en mémoire...');
    }
  }

  // Fallback: MongoDB Memory Server (dev/test)
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = new MongoMemoryServer();
    await mongod.start();
    const memUri = mongod.getUri();
    await mongoose.connect(memUri);
    console.log('MongoDB en mémoire connecté (données temporaires)');
  } catch (err) {
    console.error('Erreur MongoDB:', err.message);
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
