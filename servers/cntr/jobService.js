import express from 'express';
import jobServiceManagement from '../model/jobServiceManagement.js';

const router = express.Router();

// Get list
router.get('/list', async (req, res) => {
    try {
        const { type, keyword, app_id } = req.query;
        const result = await jobServiceManagement.getJobServiceList(type, keyword, app_id);

        res.json(result);
    } catch (error) {
        console.error('Error fetching JobService list:', error);
        res.status(500).json({ message: 'Error fetching JobService list', error: error.message });
    }
});

// Get detail
router.get('/detail', async (req, res) => {
    try {
        const { app_id } = req.query;
        const result = await jobServiceManagement.getJobServiceDetail(app_id);

        res.json(result || {});
    } catch (error) {
        console.error('Error fetching JobService detail:', error);
        res.status(500).json({ message: 'Error fetching JobService detail', error: error.message });
    }
});

// Save List
router.post('/saveList', async (req, res) => {
    try {
        const list = req.body;
        const result = await jobServiceManagement.saveJobServiceList(list);
        
        res.json({ message: 'List saved successfully', result });
    } catch (error) {
        console.error('Error saving JobService list:', error);
        res.status(500).json({ message: 'Error saving JobService list', error: error.message });
    }
});

// Delete
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await jobServiceManagement.deleteJobService(id);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting JobService:', error);
        res.status(500).json({ message: 'Error deleting JobService', error: error.message });
    }
});

// Get list
router.get('/svrList', async (req, res) => {
    try {
        const { type, keyword, prj_id, app_id } = req.query;
        const result = await jobServiceManagement.getSvrServiceList(type, keyword, prj_id, app_id);

        res.json(result);
    } catch (error) {
        console.error('Error fetching SvrService list:', error);
        res.status(500).json({ message: 'Error fetching SvrService list', error: error.message });
    }
});

// Get detail
router.get('/svrDetail', async (req, res) => {
    try {
        const { prj_id, app_id } = req.query;
        const result = await jobServiceManagement.getSvrServiceDetail(prj_id, app_id);

        res.json(result || {});
    } catch (error) {
        console.error('Error fetching SvrService detail:', error);
        res.status(500).json({ message: 'Error fetching SvrService detail', error: error.message });
    }
});

// Save List
router.post('/svrSaveList', async (req, res) => {
    try {
        const list = req.body;
        const result = await jobServiceManagement.saveSvrServiceList(list);
        
        res.json({ message: 'List saved successfully', result });
    } catch (error) {
        console.error('Error saving SvrService list:', error);
        res.status(500).json({ message: 'Error saving SvrService list', error: error.message });
    }
});

// Delete
router.delete('/svrDelete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await jobServiceManagement.deleteSvrService(id);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting SvrService:', error);
        res.status(500).json({ message: 'Error deleting SvrService', error: error.message });
    }
});

export default router;