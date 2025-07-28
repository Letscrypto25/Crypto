const express = require('express');
const router = express.Router();
const db = require('../firebase-admin');

router.get('/', async (req, res) => {
  try {
    const usersSnap = await db.ref('users').once('value');
    const users = usersSnap.val() || {};
    const winners = Object.entries(users)
      .filter(([_, data]) => data.balance > 0)
      .map(([gmail]) => gmail);
    const winner = winners[Math.floor(Math.random() * winners.length)] || 'No entries';
    res.json({ winner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
