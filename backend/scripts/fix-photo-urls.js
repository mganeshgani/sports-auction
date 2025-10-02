require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

const playerSchema = new mongoose.Schema({
  name: String,
  regNo: String,
  class: String,
  position: String,
  photoUrl: String,
  status: String,
  team: mongoose.Schema.Types.ObjectId,
  soldAmount: Number,
  createdAt: Date
});

const Player = mongoose.model('Player', playerSchema);

async function fixPhotoUrls() {
  try {
    console.log('Starting photo URL fix...');
    
    // Find all players with placeholder URLs
    const playersToFix = await Player.find({
      photoUrl: { $regex: /via\.placeholder\.com/ }
    });
    
    console.log(`Found ${playersToFix.length} players with placeholder URLs`);
    
    for (const player of playersToFix) {
      // Extract player name from placeholder URL or use regNo for photo path
      const photoPath = `/player-photos/${player.regNo}.jpg`;
      
      console.log(`Updating ${player.name} (${player.regNo}): ${player.photoUrl} -> ${photoPath}`);
      
      player.photoUrl = photoPath;
      await player.save();
    }
    
    console.log('✅ Photo URLs fixed successfully!');
    console.log(`Updated ${playersToFix.length} players`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing photo URLs:', error);
    process.exit(1);
  }
}

fixPhotoUrls();
