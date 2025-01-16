import express from 'express';
import { verifyStudentToken } from '../middleware/JwtMiddleware.js'; // Assuming students need to access this
import Quiz from '../models/Quiz.js';

const router = express.Router();

// Fetch quiz details by ID
router.get('/quiz/:quizId', verifyStudentToken, async (req, res) => {
    try {
        const { quizId } = req.params;

        // Find the quiz by ID
        const quiz = await Quiz.findById(quizId).populate('questions');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        res.status(200).json(quiz);
    } catch (error) {
        console.error('Error fetching quiz details:', error.message);
        res.status(500).json({ message: 'Server error while fetching quiz details.' });
    }
});
router.get('/quiz/:quizId/submission', verifyStudentToken, async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user.id;

        const submission = await Submission.findOne({ quizId, studentId });

        if (!submission) {
            return res.status(404).json({ message: 'No submission found for this quiz.' });
        }

        res.status(200).json(submission);
    } catch (error) {
        console.error('Error checking submission:', error.message);
        res.status(500).json({ message: 'Server error while checking submission.' });
    }
});

export default router;
