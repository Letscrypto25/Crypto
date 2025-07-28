const express = require('express');
const router = express.Router();
const db = require('../firebase-admin');

router.post('/', async (req, res) => {
  const { gmail, amount } = req.body;
  try {
    const ref = db.ref(`users/${gmail}/balance`);
    const snap = await ref.once('value');
    const current = snap.val() || 0;
    await ref.set(current + amount);
    res.json({ message: 'Payment recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
