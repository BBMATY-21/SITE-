const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Connexion à MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/location-saisonniere');
    console.log(`MongoDB connecté: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Erreur de connexion MongoDB: ${err.message}`);
    // Ne pas tuer le serveur, réessayer dans 5 secondes
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
