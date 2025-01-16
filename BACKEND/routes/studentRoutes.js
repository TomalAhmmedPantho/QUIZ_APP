import express from 'express';
import { verifyStudentToken } from '../middleware/JwtMiddleware.js';
import StudentController from '../controllers/StudentController.js';

const router = express.Router();

// Route to get associated teachers
router.get('/teachers/associated', verifyStudentToken, StudentController.getAssociatedTeachers);
// Route to view running and upcoming quizzes
router.get('/quizzes', verifyStudentToken, StudentController.viewQuiz);

// Route to take and submit a quiz
router.post('/quiz/submit', verifyStudentToken, StudentController.takeQuiz);

// Route to view quiz results
router.get('/quiz-results', verifyStudentToken, StudentController.viewQuizResults);
export default router;
