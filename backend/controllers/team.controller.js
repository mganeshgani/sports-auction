const Team = require('../models/team.model');
const Player = require('../models/player.model');

// Create new team
exports.createTeam = async (req, res) => {
  try {
    const { name, totalSlots, budget } = req.body;
    
    const team = new Team({
      name,
      totalSlots,
      budget,
      remainingBudget: budget
    });

    await team.save();
    res.status(201).json(team);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ error: 'Team name already exists' });
    }
    res.status(500).json({ error: 'Error creating team' });
  }
};

// Update team
exports.updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const updateData = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Handle MongoDB $push operation for adding players
    if (updateData.$push && updateData.$push.players) {
      team.players.push(updateData.$push.players);
      team.filledSlots = team.players.length;
      await team.save();
      return res.json(team);
    }

    // Regular update fields
    const { name, totalSlots, budget } = updateData;

    // Validate total slots
    if (totalSlots && totalSlots < team.filledSlots) {
      return res.status(400).json({ 
        error: 'New total slots cannot be less than current filled slots' 
      });
    }

    // Update fields
    if (name) team.name = name;
    if (totalSlots) team.totalSlots = totalSlots;
    if (budget !== undefined) {
      const spentBudget = team.budget ? (team.budget - (team.remainingBudget || 0)) : 0;
      team.budget = budget;
      team.remainingBudget = budget - spentBudget;
    }

    await team.save();
    res.json(team);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Team name already exists' });
    }
    res.status(500).json({ error: 'Error updating team' });
  }
};

// Delete team
exports.deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if team has players
    if (team.filledSlots > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete team with assigned players' 
      });
    }

    await team.deleteOne();
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting team' });
  }
};

// Get all teams
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate('players');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching teams' });
  }
};

// Get team by ID
exports.getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId).populate('players');
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching team' });
  }
};

// Get final results
exports.getFinalResults = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('players')
      .sort('name');

    const results = teams.map(team => ({
      teamName: team.name,
      totalPlayers: team.filledSlots,
      totalSlots: team.totalSlots,
      budget: team.budget,
      remainingBudget: team.remainingBudget,
      players: team.players.map(player => ({
        name: player.name,
        regNo: player.regNo,
        class: player.class,
        position: player.position,
        soldAmount: player.soldAmount
      }))
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching final results' });
  }
};

// Delete all teams (for auction reset)
exports.deleteAllTeams = async (req, res) => {
  try {
    const result = await Team.deleteMany({});
    res.json({ 
      message: 'All teams deleted successfully', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting all teams' });
  }
};