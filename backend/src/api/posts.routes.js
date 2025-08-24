const express = require('express');
const router = express.Router();
const { createPost, getPosts } = require('../controllers/post.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('admin', 'administrator'));

router.post('/', createPost);
router.get('/', getPosts);

module.exports = router;
