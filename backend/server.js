const express = require('express');
const cors = require('cors');
const db = require('./firebase-admin');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

// POST /payment
app.post('/payment', async (req, res) => {
  const { gmail, amount } = req.body;
  if (!gmail || typeof amount !== 'number') return res.status(400).send('Invalid payload');

  try {
    const userRef = db.ref(`users/${gmail.replace('.', '_')}/balance`);
    const snapshot = await userRef.once('value');
    const currentBalance = snapshot.val() || 0;
    await userRef.set(currentBalance + amount);
    res.send({ message: 'Payment recorded', newBalance: currentBalance + amount });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// GET /balance/:gmail
app.get('/balance/:gmail', async (req, res) => {
  const gmail = req.params.gmail.replace('.', '_');
  try {
    const snapshot = await db.ref(`users/${gmail}/balance`).once('value');
    res.send({ balance: snapshot.val() || 0 });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// POST /strategy
app.post('/strategy', async (req, res) => {
  const { gmail, strategy } = req.body;
  if (!gmail || !strategy) return res.status(400).send('Missing gmail or strategy');
  try {
    await db.ref(`strategies/${gmail.replace('.', '_')}`).set(strategy);
    res.send({ message: 'Strategy saved' });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// GET /draw/:type (weekly or monthly)
app.get('/draw/:type', async (req, res) => {
  const type = req.params.type;
  if (!['weekly', 'monthly'].includes(type)) return res.status(400).send('Invalid draw type');

  try {
    const usersSnapshot = await db.ref('users').once('value');
    const users = usersSnapshot.val();
    const gmailList = Object.keys(users || {});
    if (gmailList.length === 0) return res.status(404).send('No users available');

    const winner = gmailList[Math.floor(Math.random() * gmailList.length)];
    const drawRef = db.ref(`draws/${type}/${new Date().toISOString()}`);
    await drawRef.set({ winner, timestamp: Date.now() });
    res.send({ winner });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
