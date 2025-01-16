import express from 'express';
import TeacherAuthController from '../controllers/TeacherAuthController.js';

const router = express.Router();

// Simplified routes for teacher registration and login
router.post('/register', TeacherAuthController.register);
router.post('/login', TeacherAuthController.loginTeacher);

export default router;
