// routes/teacherRoutes.js
import express from 'express';
import { verifyTeacherToken } from '../middleware/JwtMiddleware.js';
import TeacherController from '../controllers/TeacherController.js';

const router = express.Router();

// Route to get all students associated with the teacher
router.get('/students/associated', verifyTeacherToken, TeacherController.getAssociatedStudents);

// Route to get all registered students not yet associated
router.get('/students/registered', verifyTeacherToken, TeacherController.getAllRegisteredStudents);

// Route to add a student to the teacher's list
router.post('/students', verifyTeacherToken, TeacherController.addStudentToTeacher);

// Route to create a new quiz
router.post('/quiz/create', verifyTeacherToken, TeacherController.createQuiz);

// Route to view all running quizzes
router.get('/quiz/status', verifyTeacherToken, TeacherController.viewQuizzes);

// Route to view submissions for a specific quiz
router.get('/quiz/submissions', verifyTeacherToken, TeacherController.viewSubmissions);
 
export default router;
