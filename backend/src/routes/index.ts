import { Router } from 'express';
import playerRoutes from './player.routes';
import teamRoutes from './team.routes';
import auctionRoutes from './auction.routes';

const router = Router();

router.use('/players', playerRoutes);
router.use('/teams', teamRoutes);
router.use('/auction', auctionRoutes);

export default router;