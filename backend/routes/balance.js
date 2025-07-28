const express = require('express');
const router = express.Router();
const db = require('../firebase-admin');

router.get('/:gmail', async (req, res) => {
  try {
    const balanceSnap = await db.ref(`users/${req.params.gmail}/balance`).once('value');
    res.json({ balance: balanceSnap.val() || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
