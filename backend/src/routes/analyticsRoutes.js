const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');

// Record a unique site visit
router.post('/visit', async (req, res) => {
    try {
        const count = await Visitor.incrementCount();
        res.json({ success: true, count });
    } catch (err) {
        console.error('Error recording visit:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
