const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

// Enable CORS for all routes
app.use(cors());

// Serve static files from the specified directory
app.get('/audio/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = req.query.path || '';
  
  // Construct the full path
  let fullPath;
  if (filePath) {
    // If a path is provided in the query parameter, use it
    fullPath = path.resolve(filePath);
  } else {
    // Otherwise, look for the file in the current directory
    fullPath = path.join(__dirname, filename);
  }
  
  console.log('Requested audio file:', fullPath);
  
  // Check if the file exists
  if (fs.existsSync(fullPath)) {
    // Set appropriate headers
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Stream the file
    const stream = fs.createReadStream(fullPath);
    stream.pipe(res);
  } else {
    console.error('File not found:', fullPath);
    res.status(404).send('File not found');
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Audio server running at http://localhost:${PORT}`);
  console.log('To access an audio file, use: http://localhost:${PORT}/audio/filename?path=/full/path/to/file');
});
