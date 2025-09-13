// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected file field.' });
  }

  if (err.message === 'Only image and video files are allowed!') {
    return res.status(400).json({ error: err.message });
  }

  // MongoDB errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation error', details: err.message });
  }

  if (err.code === 11000) {
    return res.status(400).json({ error: 'Duplicate field value' });
  }

  // Default error
  res.status(500).json({ error: 'Internal server error' });
};

module.exports = errorHandler; 