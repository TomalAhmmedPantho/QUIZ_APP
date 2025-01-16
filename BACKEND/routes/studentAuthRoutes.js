import express from 'express';
import StudentAuthController from '../controllers/StudentAuthController.js';

const router = express.Router();

// Student registration route
router.post('/register', StudentAuthController.register);

// Student login route
router.post('/login', StudentAuthController.login);

export default router;
