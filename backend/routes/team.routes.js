const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');

// Create new team
router.post('/', teamController.createTeam);

// Update team
router.put('/:teamId', teamController.updateTeam);

// Update team (PATCH - same as PUT)
router.patch('/:teamId', teamController.updateTeam);

// Delete team
router.delete('/:teamId', teamController.deleteTeam);

// Get all teams
router.get('/', teamController.getAllTeams);

// Get team by ID
router.get('/:teamId', teamController.getTeamById);

// Get final results
router.get('/results/final', teamController.getFinalResults);

// Delete all teams (for auction reset)
router.delete('/', teamController.deleteAllTeams);

module.exports = router;