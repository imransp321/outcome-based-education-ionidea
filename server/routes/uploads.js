const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Serve uploaded files
router.get('/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'uploads', filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
  
  // Set appropriate headers for different file types
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') {
    res.setHeader('Content-Type', 'application/pdf');
  } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
    res.setHeader('Content-Type', `image/${ext.slice(1)}`);
  } else if (['.doc', '.docx'].includes(ext)) {
    res.setHeader('Content-Type', 'application/msword');
  }
  
  res.setHeader('Content-Disposition', 'inline');
  res.sendFile(filePath);
});

module.exports = router;
