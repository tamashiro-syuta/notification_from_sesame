import express from 'express';
import { lock, sample, webhook } from './controllers/notifyAfterOperateSesameController';
import { healthCheck } from './controllers/healthCheckController';
import { isAuthenticated } from './middleware/isAuthenticated';
import { authenticate } from './middleware/authenticate';

export const router = express.Router();

router.use('/lock', isAuthenticated);
router.use('/webhook', isAuthenticated);
router.use('/webhook', authenticate);

router.get('/', healthCheck);
router.get('/lock', lock);
router.post('/webhook', webhook);
router.get('/sample', sample);