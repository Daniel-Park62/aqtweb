import express from 'express';
import projectManagement from '../model/projectManagement.js';

const router = express.Router();

// top project list
router.get('/list', async (req, res) => {
    try {
        const { type, keyword } = req.query;
        const result = await projectManagement.getProjectList(type, keyword);
        res.json(result);
    } catch (error) {
        console.error('Error fetching project list:', error);
        res.status(500).json({ message: 'Error fetching project list', error: error.message });
    }
});

// top project Save
router.post('/save', async (req, res) => {
    const projectData = req.body;
    try {
        if (!projectData.prj_nm) {
            return res.status(400).send("Project Name is required");
        }

        const result = await projectManagement.saveProject(projectData);

        if (projectData.prj_id && projectData.prj_id !== '자동생성' && projectData.prj_id !== '') {
            res.json({ message: 'Project updated successfully' });
        } else {
            res.json({ message: 'Project added successfully', id: result.insertId });
        }
    } catch (error) {
        console.error('Error saving project:', error);
        res.status(500).json({ message: 'Error saving project', error: error.message });
    }
});

// top virtual column1 Save
router.post('/saveapp1', async (req, res) => {
    const projectData = req.body;
    try {
        const result = await projectManagement.saveVirtCol1(projectData);

        if (projectData.virtual_col1 && projectData.virtual_col1 !== '') {
            res.json({ message: 'Virtual Column1 updated successfully' });
        } else {
            res.json({ message: 'Virtual Column1 added successfully', id: result.insertId });
        }
    } catch (error) {
        console.error('Error saving Virtual Column1 :', error);
        res.status(500).json({ message: 'Error saving Virtual Column1 ', error: error.message });
    }
});

// top virtual column2 Save
router.post('/saveapp2', async (req, res) => {
    const projectData = req.body;
    try {
        const result = await projectManagement.saveVirtCol2(projectData);

        if (projectData.virtual_col2 && projectData.virtual_col2 !== '') {
            res.json({ message: 'Virtual Column2 updated successfully' });
        } else {
            res.json({ message: 'Virtual Column2 added successfully', id: result.insertId });
        }
    } catch (error) {
        console.error('Error saving Virtual Column2 :', error);
        res.status(500).json({ message: 'Error saving Virtual Column2 ', error: error.message });
    }
});

// top project Delete (삭제버튼 없음:프로젝트 삭제는 DB 에서 직접 수작업으로..)
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await projectManagement.deleteProject(id);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Error deleting project', error: error.message });
    }
});

// bottom Get Next APP_ID
router.get('/business/next-app-id', async (req, res) => {
    try {
        const nextId = await projectManagement.getNextAppId();
        res.json({ nextId });
    } catch (error) {
        console.error('Error getting next APP_ID:', error);
        res.status(500).json({ message: 'Error getting next APP_ID', error: error.message });
    }
});

// bottom Business List
router.get('/business/list', async (req, res) => {
    try {
        const { type, keyword, projectId } = req.query;
        const result = await projectManagement.getBusinessList(type, keyword, projectId);
        res.json(result);
    } catch (error) {
        console.error('Error fetching business list:', error);
        res.status(500).json({ message: 'Error fetching business list', error: error.message });
    }
});

// bottom Save Business Item
router.post('/business/save', async (req, res) => {
    try {
        const data = req.body;
        const result = await projectManagement.saveBusiness(data);
        res.json({ message: 'Saved successfully', result });
    } catch (error) {
        console.error('Error saving business item:', error);
        res.status(500).json({ message: 'Error saving business item', error: error.message });
    }
});

// bottom Delete Business Item
router.delete('/business/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await projectManagement.deleteBusiness(id);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting business item:', error);
        res.status(500).json({ message: 'Error deleting business item', error: error.message });
    }
});

export default router;
