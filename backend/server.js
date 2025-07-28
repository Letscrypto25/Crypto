require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.use('/payment', require('./routes/payment'));
app.use('/balance', require('./routes/balance'));
app.use('/strategy', require('./routes/strategy'));
app.use('/draw', require('./routes/draw'));

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
