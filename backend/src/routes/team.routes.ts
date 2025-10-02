import { Router, Request, Response } from 'express';
import Team from '../models/Team';

const router = Router();

// Get all teams
router.get('/', async (req: Request, res: Response) => {
  try {
    const teams = await Team.find().populate('players');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teams' });
  }
});

// Get a single team
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const team = await Team.findById(req.params.id).populate('players');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team' });
  }
});

// Create team
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, budget, totalSlots } = req.body;
    const team = new Team({
      name,
      budget,
      totalSlots: totalSlots || 11,
      players: []
    });
    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error creating team' });
  }
});

// Update team
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    // Handle different update operations
    const updateOperation = req.body.$push ? req.body : { $set: req.body };
    
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      updateOperation,
      { new: true }
    ).populate('players');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Emit real-time update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('teamUpdated', team);
      console.log('✓ Emitted teamUpdated event:', team.name);
    }
    
    res.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Error updating team' });
  }
});

// Add player to team
router.post('/:id/players', async (req: Request, res: Response) => {
  try {
    const { playerId, soldPrice } = req.body;
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Validation can be added here if needed

    // Update team
    team.players.push(playerId);
    team.budget -= soldPrice;
    await team.save();

    // Update player
    const updatedTeam = await Team.findById(req.params.id).populate('players');
    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: 'Error adding player to team' });
  }
});

// Remove player from team
router.delete('/:id/players/:playerId', async (req: Request, res: Response) => {
  try {
    const { id, playerId } = req.params;
    const team = await Team.findById(id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    team.players = team.players.filter(p => p.toString() !== playerId);
    await team.save();

    const updatedTeam = await Team.findById(id).populate('players');
    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: 'Error removing player from team' });
  }
});

// Delete all teams (for reset functionality)
router.delete('/', async (req: Request, res: Response) => {
  try {
    const result = await Team.deleteMany({});
    res.json({ 
      message: 'All teams deleted successfully', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting all teams:', error);
    res.status(500).json({ message: 'Error deleting all teams' });
  }
});

// Delete team
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting team' });
  }
});

export default router;