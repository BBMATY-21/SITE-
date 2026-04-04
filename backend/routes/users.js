const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// POST inscription
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Un compte existe déjà avec cet email' });
    }

    const user = new User({ firstName, lastName, email, password, phone, role });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key_change_me', {
      expiresIn: '7d'
    });

    res.json({ token, user: { id: user._id, firstName, lastName, email, role: user.role, phone: user.phone, avatar: user.avatar, bio: user.bio } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key_change_me', {
      expiresIn: '7d'
    });

    res.json({ token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email, role: user.role, phone: user.phone, avatar: user.avatar, bio: user.bio } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET profil courant (authentifié)
router.get('/me', auth, async (req, res) => {
  res.json({ id: req.user._id, firstName: req.user.firstName, lastName: req.user.lastName, email: req.user.email, role: req.user.role, phone: req.user.phone, avatar: req.user.avatar, bio: req.user.bio });
});

// PUT mettre à jour mon profil (authentifié)
router.put('/me', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, avatar, bio } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;

    await user.save();
    res.json({ id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar, bio: user.bio });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET profil public d'un utilisateur (pour afficher l'hôte)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('firstName lastName avatar bio phone createdAt');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
