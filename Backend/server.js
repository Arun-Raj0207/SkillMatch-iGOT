require('dotenv').config();

const express = require('express');
const cors = require('cors');

const competencyRoutes = require('./routes/competency.routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

// No auth required — just confirms the server is up.
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/competency', competencyRoutes);

// 404 for anything else under /api
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`SkillMatch backend listening on port ${PORT}`);
});
