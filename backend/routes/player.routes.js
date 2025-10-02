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