# Fix Player Photo URLs

This script updates all players in the database that have `via.placeholder.com` URLs to use the correct photo paths from the `/player-photos/` folder.

## How to Run:

1. Make sure you're in the backend directory:
   ```bash
   cd backend
   ```

2. Run the fix script:
   ```bash
   node scripts/fix-photo-urls.js
   ```

3. The script will:
   - Find all players with placeholder URLs
   - Update their photoUrl to `/player-photos/{regNo}.jpg`
   - Save the changes to the database

## Expected Output:

```
Connected to MongoDB
Starting photo URL fix...
Found 25 players with placeholder URLs
Updating Abhishek (25251401): https://via.placeholder.com/... -> /player-photos/25251401.jpg
Updating Anwesh B (24250113): https://via.placeholder.com/... -> /player-photos/24250113.jpg
...
✅ Photo URLs fixed successfully!
Updated 25 players
```

## After Running:

1. Refresh your frontend application
2. Player photos should now load from `/player-photos/` folder
3. If a photo doesn't exist, it will show the colorful initial fallback
