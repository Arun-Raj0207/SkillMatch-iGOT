const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getLatestAssessment, runAssessment } = require('../controllers/competency.controller');

const router = express.Router();

router.get('/assess', requireAuth, getLatestAssessment);
router.post('/assess', requireAuth, runAssessment);

module.exports = router;
