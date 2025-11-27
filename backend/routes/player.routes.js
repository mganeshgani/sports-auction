const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const playerController = require('../controllers/player.controller');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const upload = multer({ 
  dest: uploadsDir,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Upload players from CSV
router.post('/upload', upload.single('file'), playerController.uploadPlayers);

// Get random unsold player (must be before /:playerId)
router.get('/random', playerController.getRandomPlayer);

// Get all unsold players (must be before /:playerId)
router.get('/unsold', playerController.getUnsoldPlayers);

// Delete all players (for auction reset - must be before /:playerId)
router.delete('/', playerController.deleteAllPlayers);

// Get all players
router.get('/', playerController.getAllPlayers);

// Assign player to team
router.post('/:playerId/assign', playerController.assignPlayer);

// Mark player as unsold
router.post('/:playerId/unsold', playerController.markUnsold);

// Remove player from team
router.delete('/:playerId/remove-from-team', playerController.removePlayerFromTeam);

// Update player (PATCH and PUT for compatibility)
router.patch('/:playerId', playerController.updatePlayer);
router.put('/:playerId', playerController.updatePlayer);

module.exports = router;