const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./users.routes')
const postRoutes = require('./posts.routes');
const pontajRoute = require('./pontaj.routes');
const procesVerbalRoutes = require('./procesVerbal.routes');
const trackingRoutes = require('./tracking.routes');
const assignmentRoutes = require('./assignments.routes'); 
const procesVerbalPredarePrimireRoutes = require('./procesVerbalPredarePrimire.routes');
const raportEvenimentRoutes = require('./raportEveniment.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes)
router.use('/posts', postRoutes);
router.use('/pontaj', pontajRoute);
router.use('/proces-verbal', procesVerbalRoutes);
router.use('/tracking', trackingRoutes);
router.use('/assignments', assignmentRoutes); 
router.use('/proces-verbal-predare', procesVerbalPredarePrimireRoutes); 
router.use('/raport-eveniment', raportEvenimentRoutes);

module.exports = router;