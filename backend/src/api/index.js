const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./users.routes')
const postRoutes = require('./posts.routes');
const pontajRoute = require('./pontaj.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes)
router.use('/posts', postRoutes);
router.use('/pontaj', pontajRoute);

module.exports = router;