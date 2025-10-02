const Player = require('../models/player.model');
const Team = require('../models/team.model');
const { parse } = require('csv-parse');
const fs = require('fs');

// Upload players from CSV
exports.uploadPlayers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(parse({ columns: true, trim: true }))
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const players = await Player.insertMany(results);
          // Delete the temporary file
          fs.unlinkSync(req.file.path);
          res.json({ message: 'Players uploaded successfully', count: players.length });
        } catch (error) {
          res.status(400).json({ error: 'Invalid CSV format or data' });
        }
      });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading players' });
  }
};

// Get random unsold player
exports.getRandomPlayer = async (req, res) => {
  try {
    const count = await Player.countDocuments({ status: 'available' });
    if (count === 0) {
      return res.status(404).json({ message: 'No available players found' });
    }

    const random = Math.floor(Math.random() * count);
    const player = await Player.findOne({ status: 'available' }).skip(random);
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching random player' });
  }
};

// Assign player to team
exports.assignPlayer = async (req, res) => {
  try {
    const { playerId, teamId, amount } = req.body;
    
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if team has available slots
    if (!team.canAddPlayer()) {
      return res.status(400).json({ error: 'Team has no available slots' });
    }

    // Check if team has enough budget
    if (!team.hasEnoughBudget(amount)) {
      return res.status(400).json({ error: 'Team does not have enough budget' });
    }

    // Update player
    player.status = 'sold';
    player.team = teamId;
    player.soldAmount = amount;
    await player.save();

    // Update team
    team.players.push(playerId);
    team.filledSlots += 1;
    if (team.budget !== null) {
      team.remainingBudget -= amount;
    }
    await team.save();

    res.json({ message: 'Player assigned successfully', player, team });
  } catch (error) {
    res.status(500).json({ error: 'Error assigning player' });
  }
};

// Mark player as unsold
exports.markUnsold = async (req, res) => {
  try {
    const { playerId } = req.params;
    const player = await Player.findById(playerId);
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    player.status = 'unsold';
    await player.save();

    res.json({ message: 'Player marked as unsold', player });
  } catch (error) {
    res.status(500).json({ error: 'Error marking player as unsold' });
  }
};

// Get all unsold players
exports.getUnsoldPlayers = async (req, res) => {
  try {
    const players = await Player.find({ status: 'unsold' });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching unsold players' });
  }
};

// Get all players
exports.getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find().populate('team', 'name');
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching players' });
  }
};

// Delete all players (for auction reset)
exports.deleteAllPlayers = async (req, res) => {
  try {
    const result = await Player.deleteMany({});
    res.json({ 
      message: 'All players deleted successfully', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting all players' });
  }
};