import { Router } from 'express';
import { Request, Response } from 'express';
import Player from '../models/Player';
import multer from 'multer';
import { parse } from 'csv-parse';
import { Readable } from 'stream';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to convert Google Drive links to direct image URLs
const convertGoogleDriveLink = (url: string): string => {
  if (!url || typeof url !== 'string') return url;
  
  // Trim whitespace
  url = url.trim();
  
  // Check if it's already a direct link
  if (url.includes('drive.google.com/uc?')) {
    return url;
  }
  
  // Pattern 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const pattern1 = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match1 = url.match(pattern1);
  if (match1 && match1[1]) {
    const fileId = match1[1];
    console.log(`✓ Converted Google Drive link (Pattern 1): ${fileId}`);
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  // Pattern 2: Any URL with id= parameter (covers multiple formats)
  // Matches: /open?id=, /u/3/open?usp=forms_web&id=, etc.
  const pattern2 = /[?&]id=([a-zA-Z0-9_-]+)/;
  const match2 = url.match(pattern2);
  if (match2 && match2[1] && url.includes('drive.google.com')) {
    const fileId = match2[1];
    console.log(`✓ Converted Google Drive link (Pattern 2): ${fileId}`);
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  // Pattern 3: Just the file ID
  if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) {
    console.log(`✓ Converting File ID to Google Drive link (Pattern 3): ${url}`);
    return `https://drive.google.com/uc?export=view&id=${url}`;
  }
  
  // If no pattern matches, return original URL (could be imgur, cloudinary, etc.)
  return url;
};

// Get all players
router.get('/', async (req: Request, res: Response) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching players' });
  }
});

// Get a single player
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching player' });
  }
});

// Upload players via CSV
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const players: any[] = [];
    const csvContent = req.file.buffer.toString('utf-8');
    
    // Use promise-based parsing
    const parser = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true // Handle UTF-8 BOM if present
    });

    for await (const row of parser) {
      // Log the row to debug
      console.log('Parsing row:', row);
      
      // Get photo URL and convert if it's a Google Drive link
      let photoUrl = row.Photo || row.photoUrl || row['Photo URL'] || row.photo_url || row.PhotoUrl || '';
      if (photoUrl) {
        photoUrl = convertGoogleDriveLink(photoUrl);
      }
      
      const player = {
        name: row['Player Name'] || row.name || row.Name || '',
        regNo: row['Registration Number'] || row.regNo || row['Reg No'] || row.regno || row.RegNo || '',
        position: row.Position || row.position || '',
        class: row.Class || row.class || '',
        photoUrl: photoUrl,
        status: 'available' as const
      };

      // Validate required fields
      if (player.name && player.regNo && player.position && player.class) {
        players.push(player);
        console.log(`✓ Valid player: ${player.name} (${player.regNo})`);
      } else {
        console.warn('⚠ Skipping invalid row - Missing required fields:', {
          name: player.name || 'MISSING',
          regNo: player.regNo || 'MISSING',
          position: player.position || 'MISSING',
          class: player.class || 'MISSING'
        });
      }
    }

    if (players.length === 0) {
      return res.status(400).json({ 
        message: 'No valid players found in CSV. Please check the format.',
        hint: 'Expected columns: name, regNo, position, class, photoUrl'
      });
    }

    // Insert players into database
    const result = await Player.insertMany(players);
    console.log(`Successfully imported ${result.length} players`);
    
    res.json({ 
      message: `${result.length} players imported successfully`,
      count: result.length 
    });

  } catch (error: any) {
    console.error('CSV upload error:', error);
    res.status(500).json({ 
      message: 'Error processing file upload', 
      error: error.message 
    });
  }
});

// Update player
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Emit real-time update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('playerUpdated', player);
      console.log('✓ Emitted playerUpdated event:', player.name);
    }
    
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: 'Error updating player' });
  }
});

// Delete all players (for reset functionality)
router.delete('/', async (req: Request, res: Response) => {
  try {
    const result = await Player.deleteMany({});
    res.json({ 
      message: 'All players deleted successfully', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting all players:', error);
    res.status(500).json({ message: 'Error deleting all players' });
  }
});

// Delete player
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting player' });
  }
});

export default router;