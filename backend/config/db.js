const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Add indexes for better performance
    await Promise.all([
      mongoose.model('Player').ensureIndexes(),
      mongoose.model('Team').ensureIndexes()
    ]);
    
    console.log('Database indexes ensured');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;