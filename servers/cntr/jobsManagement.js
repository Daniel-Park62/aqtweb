import express from 'express';
import jobs from '../model/jobs.js';

const router = express.Router();

/**
 * GET /project/list
 * Returns the list of projects (from mock SQL)
 */
router.get('/project/list', async (req, res) => {
    try {
        const result = await jobs.getProjectList();
        res.json(result);
    } catch (error) {
        console.error('Error fetching project list:', error);
        res.status(500).json({ message: 'Error fetching project list', error: error.message });
    }
});

/**
 * GET /job/list
 * Returns the list of jobs (from mock SQL)
 */
router.get('/job/list', async (req, res) => {
    try {
        const result = await jobs.getJobList();
        res.json(result);
    } catch (error) {
        console.error('Error fetching job list:', error);
        res.status(500).json({ message: 'Error fetching job list', error: error.message });
    }
});


export default router;
