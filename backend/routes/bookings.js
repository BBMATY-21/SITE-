const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// GET réservations pour mes propriétés (authentifié)
router.get('/mine', auth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({ path: 'property', match: { owner: req.user._id } })
      .populate('guest', 'firstName lastName email');
    // Filter out bookings where property didn't match
    const filtered = bookings.filter(b => b.property !== null);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET réservations d'une propriété (public - pour le calendrier)
router.get('/property/:propertyId', async (req, res) => {
  try {
    const bookings = await Booking.find({
      property: req.params.propertyId,
      status: { $ne: 'cancelled' }
    }).select('checkInDate checkOutDate');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST créer une réservation (authentifié)
router.post('/', auth, async (req, res) => {
  try {
    const { property, checkInDate, checkOutDate } = req.body;

    const conflict = await Booking.findOne({
      property,
      status: { $ne: 'cancelled' },
      $or: [
        { checkInDate: { $lt: new Date(checkOutDate), $gte: new Date(checkInDate) } },
        { checkOutDate: { $gt: new Date(checkInDate), $lte: new Date(checkOutDate) } }
      ]
    });

    if (conflict) {
      return res.status(400).json({ message: 'Ces dates ne sont pas disponibles' });
    }

    const booking = new Booking({
      ...req.body,
      guest: req.user._id
    });
    const newBooking = await booking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT mettre à jour le statut (authentifié)
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Réservation non trouvée' });

    Object.assign(booking, req.body);
    const updated = await booking.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
