const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const auth = require('../middleware/auth');

// GET toutes les propriétés (public)
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find().populate('owner', 'firstName lastName');
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET mes propriétés (authentifié)
router.get('/mine', auth, async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET une propriété par ID (public)
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'firstName lastName');
    if (!property) return res.status(404).json({ message: 'Propriété non trouvée' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST créer une propriété (authentifié)
router.post('/', auth, async (req, res) => {
  try {
    const property = new Property({
      ...req.body,
      owner: req.user._id
    });
    const newProperty = await property.save();
    res.status(201).json(newProperty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT mettre à jour (authentifié, propriétaire uniquement)
router.put('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Propriété non trouvée' });
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    Object.assign(property, req.body);
    const updated = await property.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE (authentifié, propriétaire uniquement)
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Propriété non trouvée' });
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    await Property.deleteOne({ _id: req.params.id });
    res.json({ message: 'Propriété supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
