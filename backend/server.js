const express = require('express');
const path = require('path');
const cors = require('cors');

// Charger les variables d'environnement EN PREMIER
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du dossier public
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes API
app.use('/api/properties', require('./routes/properties'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/users', require('./routes/users'));

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'Serveur actif', timestamp: new Date().toISOString() });
});

// Toute route non-API renvoie index.html (SPA fallback)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }
});

const PORT = process.env.PORT || 5000;

// Démarrer le serveur PUIS connecter la DB (le serveur ne crash pas si la DB est lente)
app.listen(PORT, () => {
  console.log(`Serveur MaisonSeason lancé sur le port ${PORT}`);
  connectDB();
});
