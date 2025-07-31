import express from 'express';
const router = express.Router();

// Mock categories endpoint
router.get('/', (req, res) => {
  res.json({
    data: [
      { id: 1, name: 'Beverages' },
      { id: 2, name: 'Snacks' },
      { id: 3, name: 'Electronics' }
    ]
  });
});

export default router;
