const express = require('express');
const router = express.Router();
const db = require('../firebase-admin');

router.post('/', async (req, res) => {
  const { gmail, strategy } = req.body;
  try {
    await db.ref(`users/${gmail}/strategy`).set(strategy);
    res.json({ message: 'Strategy saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
