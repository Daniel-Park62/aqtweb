import express from 'express';
import jobModel from '../model/jobModel.js';

const router = express.Router();

/**
 * 전문 관리 라우트
 */
// 공통전문 목록 조회
router.get('/message/commheaderlist', async (req, res) => {
    try {
        const result = await jobModel.getCommHeaderList(req.query);
        res.json(result);
    } catch (error) {
        console.error('Error fetching Svc/Uri list:', error);
        res.status(500).json({ message: 'Error fetching Svc/Uri list', error: error.message });
    }
});

// 연관전문 목록 조회
router.get('/message/relmsglist', async (req, res) => {
    try {
        const result = await jobModel.getRelMsgList(req.query);
        res.json(result);
    } catch (error) {
        console.error('Error fetching Svc/Uri list:', error);
        res.status(500).json({ message: 'Error fetching Svc/Uri list', error: error.message });
    }
});

// SVC/URI 목록 조회
router.get('/message/svcurilist', async (req, res) => {
    try {
        const result = await jobModel.getSvcUriList(req.query);
        res.json(result);
    } catch (error) {
        console.error('Error fetching Svc/Uri list:', error);
        res.status(500).json({ message: 'Error fetching Svc/Uri list', error: error.message });
    }
});

// 전문 목록 조회
router.get('/message/list', async (req, res) => {
    try {
        const result = await jobModel.getMessageList(req.query);
        res.json(result);
    } catch (error) {
        console.error('Error fetching message list:', error);
        res.status(500).json({ message: 'Error fetching message list', error: error.message });
    }
});

// 전문 저장 (추가/수정)
router.post('/message/save', async (req, res) => {
    try {
        const result = await jobModel.saveMessage(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ message: 'Error saving message', error: error.message });
    }
});

// 전문 삭제
router.post('/message/delete', async (req, res) => {
    try {
        const result = await jobModel.deleteMessage(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Error deleting message', error: error.message });
    }
});

/**
 * 필드(항목) 관리 라우트
 */
// 공통 단건 필드, 데이터 목록 조회
router.get('/field/listcomm', async (req, res) => {
    try {
        const result = await jobModel.getCommListData(req.query);
        res.json(result);
    } catch (error) {
        console.error('Error fetching field list:', error);
        res.status(500).json({ message: 'Error fetching field list', error: error.message });
    }
});

// 필드 목록 조회
router.get('/field/listcommfield', async (req, res) => {
    try {
        const result = await jobModel.getCommList(req.query);
        res.json(result);
    } catch (error) {
        console.error('Error fetching field list:', error);
        res.status(500).json({ message: 'Error fetching field list', error: error.message });
    }
});

// 신규등록/수정 업무전문데이터 양식+데이터 조회
router.get('/field/listMessdata', async (req, res) => {
    try {
        const result = await jobModel.getMessListData(req.query);
        res.json(result);
    } catch (error) {
        console.error('Error getMessListData :', error);
        res.status(500).json({ message: 'Error getMessListData ', error: error.message });
    }
});

// 신규등록/수정 업무전문데이터 양식 조회
router.get('/field/listMess', async (req, res) => {
    try {
        const result = await jobModel.getMessList(req.query);
        res.json(result);
    } catch (error) {
        console.error('Error getMessList :', error);
        res.status(500).json({ message: 'Error getMessList', error: error.message });
    }
});


// 업무전문데이터 양식 조회
router.get('/field/Messlist', async (req, res) => {
    try {
        const result = await jobModel.getMessListMess(req.query);
        res.json(result);
    } catch (error) {
        console.error('Error getMessList :', error);
        res.status(500).json({ message: 'Error getMessList', error: error.message });
    }
});
// 전문데이터조회
router.get('/field/listdata', async (req, res) => {
    try {
        const result = await jobModel.getFieldListData(req.query);
        res.json(result);
    } catch (error) {
        console.error('Error fetching field list:', error);
        res.status(500).json({ message: 'Error fetching field list', error: error.message });
    }
});

// 업무 단건 데이터 저장 (추가/수정)
router.post('/field/savedata', async (req, res) => {
    try {
        const result = await jobModel.saveFieldData(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error saving field Data:', error);
        res.status(500).json({ message: 'Error saving field Data', error: error.message });
    }
});

// 필드 목록 조회
router.get('/field/list', async (req, res) => {
    try {
        const result = await jobModel.getFieldList(req.query);
        res.json(result);
    } catch (error) {
        console.error('Error fetching field list:', error);
        res.status(500).json({ message: 'Error fetching field list', error: error.message });
    }
});

// 필드 저장 (추가/수정)
router.post('/field/save', async (req, res) => {
    try {
        const result = await jobModel.saveField(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error saving field:', error);
        res.status(500).json({ message: 'Error saving field', error: error.message });
    }
});

// 필드 삭제
router.post('/field/delete', async (req, res) => {
    try {
        const result = await jobModel.deleteField(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error deleting field:', error);
        res.status(500).json({ message: 'Error deleting field', error: error.message });
    }
});

/**
 * 데이터(인스턴스) 관리 라우트
 */
// 데이터 목록 조회
router.get('/data/list', async (req, res) => {
    try {
        const result = await jobModel.getDataList(req.query);
        res.json(result);
    } catch (error) {
        console.error('Error fetching data list:', error);
        res.status(500).json({ message: 'Error fetching data list', error: error.message });
    }
});

// 데이터 저장 (추가/수정)
router.post('/data/save', async (req, res) => {
    try {
        const result = await jobModel.saveData(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ message: 'Error saving data', error: error.message });
    }
});

// 데이터 삭제
router.post('/data/delete', async (req, res) => {
    try {
        const result = await jobModel.deleteData(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).json({ message: 'Error deleting data', error: error.message });
    }
});


export default router;
