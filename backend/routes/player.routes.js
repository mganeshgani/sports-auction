const express = require('express');
const router = express.Router();
const multer = require('multer');
const playerController = require('../controllers/player.controller');

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

// Upload players from CSV
router.post('/upload', upload.single('file'), playerController.uploadPlayers);

// Get random unsold player
router.get('/random', playerController.getRandomPlayer);

// Assign player to team
router.post('/:playerId/assign', playerController.assignPlayer);

// Mark player as unsold
router.post('/:playerId/unsold', playerController.markUnsold);

// Get all unsold players
router.get('/unsold', playerController.getUnsoldPlayers);

// Get all players
router.get('/', playerController.getAllPlayers);

// Update player (PATCH)
router.patch('/:playerId', playerController.updatePlayer);

// Delete all players (for auction reset)
router.delete('/', playerController.deleteAllPlayers);

module.exports = router;