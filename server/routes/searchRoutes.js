const express = require('express');
const router = express.Router();
const { searchManga } = require('../controllers/searchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, searchManga);

module.exports = router;