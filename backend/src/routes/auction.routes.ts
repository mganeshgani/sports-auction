import { Router, Request, Response } from 'express';
import Player from '../models/Player';
import Team from '../models/Team';

const router = Router();

// Get auction status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const availablePlayers = await Player.find({ status: 'available' });
    const soldPlayers = await Player.find({ status: 'sold' }).populate('team');
    const teams = await Team.find().populate('players');

    res.json({
      summary: {
        availablePlayers: availablePlayers.length,
        soldPlayers: soldPlayers.length,
        totalTeams: teams.length
      },
      players: {
        available: availablePlayers,
        sold: soldPlayers
      },
      teams
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching auction status' });
  }
});

// Get next player for auction
router.get('/next-player', async (req: Request, res: Response) => {
  try {
    const player = await Player.findOne({ status: 'available' });
    if (!player) {
      return res.status(404).json({ message: 'No players available for auction' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching next player' });
  }
});

// Complete player auction
router.post('/complete-auction', async (req: Request, res: Response) => {
  try {
    const { playerId, teamId, soldPrice } = req.body;
    
    const player = await Player.findById(playerId);
    const team = await Team.findById(teamId);

    if (!player || !team) {
      return res.status(404).json({ message: 'Player or team not found' });
    }

    // Update player
    player.status = 'sold';
    player.team = teamId;
    player.soldAmount = soldPrice;
    await player.save();

    // Update team
    team.players.push(playerId);
    team.budget -= soldPrice;
    await team.save();

    res.json({ player, team });
  } catch (error) {
    res.status(500).json({ message: 'Error completing auction' });
  }
});

// Mark player as unsold
router.post('/mark-unsold', async (req: Request, res: Response) => {
  try {
    const { playerId } = req.body;
    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    player.status = 'unsold';
    await player.save();

    res.json(player);
  } catch (error) {
    res.status(500).json({ message: 'Error marking player as unsold' });
  }
});

// Get auction results
router.get('/results', async (req: Request, res: Response) => {
  try {
    const teams = await Team.find().populate('players');
    const soldPlayers = await Player.find({ status: 'sold' }).populate('team');
    const unsoldPlayers = await Player.find({ status: 'unsold' });

    const results = {
      teams: teams.map(team => ({
        ...team.toObject(),
        totalPlayers: team.players.length,
        remainingBudget: team.budget
      })),
      soldPlayers: soldPlayers.map(player => ({
        ...player.toObject()
      })),
      unsoldPlayers,
      statistics: {
        totalPlayers: soldPlayers.length + unsoldPlayers.length,
        soldPlayers: soldPlayers.length,
        unsoldPlayers: unsoldPlayers.length,
        totalSpent: soldPlayers.reduce((sum, p) => sum + (p.soldAmount || 0), 0),
        averagePrice: soldPlayers.length 
          ? soldPlayers.reduce((sum, p) => sum + (p.soldAmount || 0), 0) / soldPlayers.length 
          : 0
      }
    };

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching auction results' });
  }
});

export default router;