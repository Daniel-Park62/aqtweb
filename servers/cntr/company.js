import express from 'express';
import companyManagement from '../model/companyManagement.js';

const router = express.Router();

// Get list
router.get('/list', async (req, res) => {
    try {
        const { searchType, keyword } = req.query;
        const result = await companyManagement.getCompanyList(searchType, keyword);
        res.json(result);
    } catch (error) {
        console.error('Error fetching company list:', error);
        res.status(500).json({ message: 'Error fetching company list', error: error.message });
    }
});

// Create
router.post('/add', async (req, res) => {
    const { company_name, company_description } = req.body;
    try {
        const result = await companyManagement.insertCompany(company_name, company_description);
        res.json({ message: 'Company added successfully', id: result.insertId });
    } catch (error) {
        console.error('Error adding company:', error);
        res.status(500).json({ message: 'Error adding company', error: error.message });
    }
});

// Update
router.put('/update', async (req, res) => {
    const { id, company_name, company_description } = req.body;
    try {
        const result = await companyManagement.updateCompany(id, company_name, company_description);
        res.json({ message: 'Company updated successfully' });
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({ message: 'Error updating company', error: error.message });
    }
});

// Delete
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await companyManagement.deleteCompany(id);
        res.json({ message: 'Company deleted successfully' });
    } catch (error) {
        console.error('Error deleting company:', error);
        res.status(500).json({ message: 'Error deleting company', error: error.message });
    }
});

export default router;
