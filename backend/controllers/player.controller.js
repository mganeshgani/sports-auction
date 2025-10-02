const Player = require('../models/player.model');
const Team = require('../models/team.model');
const { parse } = require('csv-parse');
const fs = require('fs');

// Upload players from CSV
exports.uploadPlayers = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    console.log('Headers:', req.headers);
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    console.log('Processing CSV file:', req.file.originalname);
    const results = [];
    
    fs.createReadStream(req.file.path)
      .pipe(parse({ columns: true, trim: true, skip_empty_lines: true }))
      .on('data', (data) => {
        console.log('CSV row:', data);
        
        // Map CSV columns to database fields
        const player = {
          name: data['Player Name'] || data.name || '',
          regNo: data['Registration Number'] || data.regNo || '',
          class: data['Class'] || data.class || '',
          position: data['Position'] || data.position || '',
          photoUrl: data['Photo'] || data.photoUrl || '',
          status: 'available'
        };
        
        // If photoUrl starts with /, prepend base URL or use placeholder
        if (player.photoUrl && player.photoUrl.startsWith('/')) {
          // You can change this base URL to your actual photo server URL
          player.photoUrl = `https://via.placeholder.com/150?text=${encodeURIComponent(player.name)}`;
        }
        
        // Add default photoUrl if missing
        if (!player.photoUrl || player.photoUrl === '') {
          player.photoUrl = 'https://via.placeholder.com/150?text=Player';
        }
        
        results.push(player);
      })
      .on('end', async () => {
        try {
          console.log('CSV parsing complete. Total rows:', results.length);
          
          if (results.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'CSV file is empty or has no valid data' });
          }
          
          // Validate required fields
          const requiredFields = ['name', 'regNo', 'class', 'position'];
          const missingFields = [];
          
          results.forEach((row, index) => {
            requiredFields.forEach(field => {
              if (!row[field] || (typeof row[field] === 'string' && row[field].trim() === '')) {
                missingFields.push(`Row ${index + 2}: missing '${field}'`); // +2 because row 1 is header, index starts at 0
              }
            });
          });
          
          if (missingFields.length > 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
              error: 'CSV validation failed',
              details: 'Missing required fields. ' + missingFields.slice(0, 5).join(', ') + (missingFields.length > 5 ? `... and ${missingFields.length - 5} more` : '')
            });
          }
          
          console.log('Attempting to insert players:', results.length);
          const players = await Player.insertMany(results, { ordered: false });
          console.log('Players inserted:', players.length);
          
          // Delete the temporary file
          fs.unlinkSync(req.file.path);
          
          res.json({ 
            message: 'Players uploaded successfully', 
            count: players.length 
          });
        } catch (error) {
          console.error('Error inserting players:', error);
          // Clean up file even on error
          if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          
          // Handle duplicate key error
          if (error.code === 11000) {
            return res.status(400).json({ 
              error: 'Duplicate player registration number found',
              details: 'One or more players with the same regNo already exist in the database'
            });
          }
          
          res.status(400).json({ 
            error: 'Invalid CSV format or data',
            details: error.message 
          });
        }
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error);
        // Clean up file on error
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(400).json({ 
          error: 'Error parsing CSV file',
          details: error.message 
        });
      });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Error uploading players',
      details: error.message 
    });
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

// Update player (PATCH)
exports.updatePlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    const updateData = req.body;

    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Update player fields
    Object.keys(updateData).forEach(key => {
      player[key] = updateData[key];
    });

    // If marking as unsold, clear team and soldAmount
    if (updateData.status === 'unsold') {
      player.team = null;
      player.soldAmount = null;
    }

    await player.save();
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Error updating player' });
  }
};