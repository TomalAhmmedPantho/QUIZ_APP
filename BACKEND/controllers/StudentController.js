import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Quiz from '../models/Quiz.js';
import Submission from '../models/Submission.js';
class StudentController {
    // Get all teachers associated with the student
    static async getAssociatedTeachers(req, res) {
        try {
            const studentId = req.user.id; // Assuming `req.user.id` contains the logged-in student's ID

            // Fetch the student and populate their associated teachers
            const student = await Student.findById(studentId).populate('associatedTeachers', 'name email subject');

            if (!student) {
                return res.status(404).json({ message: 'Student not found.' });
            }

            const associatedTeachers = student.associatedTeachers;

            if (associatedTeachers.length === 0) {
                return res.status(404).json({ message: 'No associated teachers found.' });
            }

            res.status(200).json({ associatedTeachers });
        } catch (error) {
            console.error('Error fetching associated teachers:', error.message);
            res.status(500).json({ message: 'Server error.' });
        }
    }

     // View running and upcoming quizzes
     static async viewQuiz(req, res) {
        try {
            const now = new Date();

            // Fetch quizzes that are running or upcoming
            const quizzes = await Quiz.find({
                $or: [
                    { startTime: { $lte: now }, endTime: { $gte: now } }, // Running quizzes
                    { startTime: { $gt: now } }, // Upcoming quizzes
                ],
            }).select('title description startTime endTime');

            if (quizzes.length === 0) {
                return res.status(404).json({ message: 'No quizzes available.' });
            }

            res.status(200).json({ quizzes });
        } catch (error) {
            console.error('Error fetching quizzes:', error.message);
            res.status(500).json({ message: 'Server error while fetching quizzes.' });
        }
    }

    // Take and submit a quiz
    static async takeQuiz(req, res) {
        try {
            const { quizId, answers } = req.body; // Answers: [{ questionId, selectedChoice }]
            const studentId = req.user.id;

            // Check if the quiz exists
            const quiz = await Quiz.findById(quizId).populate('questions');
            if (!quiz) {
                return res.status(404).json({ message: 'Quiz not found.' });
            }

            // Check if the quiz is still running
            const now = new Date();
            if (now < quiz.startTime || now > quiz.endTime) {
                return res.status(400).json({ message: 'Quiz is not currently running.' });
            }

            // Check if the student has already submitted this quiz
            const existingSubmission = await Submission.findOne({ quizId, studentId });
            if (existingSubmission) {
                return res.status(400).json({ message: 'You have already submitted this quiz.' });
            }

            // Calculate the score
            let score = 0;
            const totalQuestions = quiz.questions.length;
            quiz.questions.forEach((question) => {
                const studentAnswer = answers.find(
                    (answer) => answer.questionId === question._id.toString()
                );
                if (studentAnswer) {
                    const correctChoice = question.choices.find((choice) => choice.isCorrect);
                    if (correctChoice && correctChoice.text === studentAnswer.selectedChoice) {
                        score++;
                    }
                }
            });

            // Save the submission
            const submission = new Submission({
                quizId,
                studentId,
                answers,
                score,
                totalQuestions,
            });
            await submission.save();

            res.status(200).json({ message: 'Quiz submitted successfully!', score, totalQuestions });
        } catch (error) {
            console.error('Error submitting quiz:', error.message);
            res.status(500).json({ message: 'Server error while submitting quiz.' });
        }
    }
     // View quiz results
     static async viewQuizResults(req, res) {
        try {
            const studentId = req.user.id;

            // Fetch all submissions made by the student
            const submissions = await Submission.find({ studentId })
                .populate('quizId', 'title description startTime endTime')
                .select('score totalQuestions quizId createdAt');

            if (!submissions || submissions.length === 0) {
                return res.status(404).json({ message: 'No quiz results found.' });
            }

            res.status(200).json({ submissions });
        } catch (error) {
            console.error('Error fetching quiz results:', error.message);
            res.status(500).json({ message: 'Server error while fetching quiz results.' });
        }
    }
}

export default StudentController;

