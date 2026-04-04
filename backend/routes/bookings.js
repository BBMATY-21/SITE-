const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Property = require('../models/Property');

// GET toutes les réservations
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('property')
      .populate('guest', 'firstName lastName email');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET réservations d'une propriété
router.get('/property/:propertyId', async (req, res) => {
  try {
    const bookings = await Booking.find({ property: req.params.propertyId });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST créer une réservation
router.post('/', async (req, res) => {
  try {
    // Vérifier la disponibilité
    const { property, checkInDate, checkOutDate } = req.body;

    const existingBooking = await Booking.findOne({
      property,
      $or: [
        { checkInDate: { $lt: checkOutDate, $gte: checkInDate } },
        { checkOutDate: { $gt: checkInDate, $lte: checkOutDate } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Ces dates ne sont pas disponibles' });
    }

    const booking = new Booking(req.body);
    const newBooking = await booking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT mettre à jour une réservation
router.put('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Réservation non trouvée' });

    Object.assign(booking, req.body);
    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE une réservation
router.delete('/:id', async (req, res) => {
  try {
    await Booking.deleteOne({ _id: req.params.id });
    res.json({ message: 'Réservation supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
