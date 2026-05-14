import express from 'express';
import sshService from './sshService.js';
import fileInfoService from './fileInfoService.js';
import fileComparisonService from './fileComparisonService.js';

const router = express.Router();

router.use('/', sshService);
router.use('/', fileInfoService);
router.use('/', fileComparisonService);

export default router;
