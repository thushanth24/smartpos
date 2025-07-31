import express from 'express';
const router = express.Router();

// Mock customers endpoint
router.get('/', (req, res) => {
  res.json({
    data: [
      { id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-1234' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '555-5678' }
    ]
  });
});

export default router;
