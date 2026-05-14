import express from 'express';
import commHeaderManagement from '../model/commHeaderManagement.js';

const router = express.Router();

// Get list
router.get('/list', async (req, res) => {
    try {
        const { type, keyword, app_id } = req.query;
        const result = await commHeaderManagement.getCommHeaderList(type, keyword, app_id);

        res.json(result);
    } catch (error) {
        console.error('Error fetching commHeader list:', error);
        res.status(500).json({ message: 'Error fetching commHeader list', error: error.message });
    }
});

// Get detail
router.get('/detail', async (req, res) => {
    try {
        const { app_id } = req.query;
        const result = await commHeaderManagement.getCommHeaderDetail(app_id);

        res.json(result || {});
    } catch (error) {
        console.error('Error fetching commHeader detail:', error);
        res.status(500).json({ message: 'Error fetching commHeader detail', error: error.message });
    }
});

// Save
router.post('/save', async (req, res) => {
    try {
        const data = req.body;
        const result = await commHeaderManagement.saveCommHeader(data);

        res.json({ message: 'Saved successfully', result });
    } catch (error) {
        console.error('Error saving commHeader:', error);
        res.status(500).json({ message: 'Error saving commHeader', error: error.message });
    }
});

// Save List
router.post('/saveList', async (req, res) => {
    try {
        const list = req.body;
        const result = await commHeaderManagement.saveCommHeaderList(list);
        
        res.json({ message: 'List saved successfully', result });
    } catch (error) {
        console.error('Error saving commHeader list:', error);
        res.status(500).json({ message: 'Error saving commHeader list', error: error.message });
    }
});

// Delete
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await commHeaderManagement.deleteCommHeader(id);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting commHeader:', error);
        res.status(500).json({ message: 'Error deleting commHeader', error: error.message });
    }
});

export default router;