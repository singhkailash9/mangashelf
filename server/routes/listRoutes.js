const express = require('express');
const router = express.Router();
const { getList, addEntry, updateEntry, deleteEntry } = require('../controllers/listController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getList);
router.post('/', addEntry);
router.patch('/:id', updateEntry);
router.delete('/:id', deleteEntry);

module.exports = router;