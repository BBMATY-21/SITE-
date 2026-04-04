const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

// GET toutes les propriétés
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find().populate('owner', 'firstName lastName email');
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET une propriété par ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner');
    if (!property) return res.status(404).json({ message: 'Propriété non trouvée' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST créer une propriété
router.post('/', async (req, res) => {
  const property = new Property(req.body);
  try {
    const newProperty = await property.save();
    res.status(201).json(newProperty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT mettre à jour une propriété
router.put('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Propriété non trouvée' });

    Object.assign(property, req.body);
    const updatedProperty = await property.save();
    res.json(updatedProperty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE une propriété
router.delete('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Propriété non trouvée' });

    await Property.deleteOne({ _id: req.params.id });
    res.json({ message: 'Propriété supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET disponibilités
router.get('/:id/availability', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Propriété non trouvée' });
    res.json(property.availableDates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
