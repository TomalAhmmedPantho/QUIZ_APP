// controllers/TeacherController.js
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Quiz from '../models/Quiz.js';
import Submission from '../models/Submission.js'


class TeacherController {

    // Get all students associated with the teacher
    static async getAssociatedStudents(req, res) {
        try {
            const teacherId = req.user.id;
            const teacher = await Teacher.findById(teacherId).populate('associatedStudents', 'name email');

            if (!teacher) {
                return res.status(404).json({ message: 'Teacher not found.' });
            }

            res.status(200).json({ associatedStudents: teacher.associatedStudents });
        } catch (error) {
            console.error('Error fetching associated students:', error.message);
            res.status(500).json({ message: 'Server error.' });
        }
    }

    // Get all registered students not yet associated with any teacher
    static async getAllRegisteredStudents(req, res) {
        try {
            const teacherId = req.user.id;
    
            // Find students not associated with the requesting teacher
            const students = await Student.find({
                associatedTeachers: { $ne: teacherId }, // Excludes students already associated with this teacher
            }).select('name email');
    
            res.status(200).json({ registeredStudents: students });
        } catch (error) {
            console.error('Error fetching registered students:', error.message);
            res.status(500).json({ message: 'Server error.' });
        }
    }
    

    // Add a student to the teacher's associated list
    // controllers/TeacherController.js
static async addStudentToTeacher(req, res) {
    try {
        const teacherId = req.user.id;
        const { studentId } = req.body;

        // Validate student existence
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        // Check if the student is already associated with this teacher
        if (student.associatedTeachers.includes(teacherId)) {
            return res.status(400).json({ message: 'Student is already associated with this teacher.' });
        }

        // Update teacher's associated students
        const teacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { $addToSet: { associatedStudents: studentId } }, // $addToSet ensures no duplicates
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found.' });
        }

        // Update student's associated teachers
        student.associatedTeachers.push(teacherId);
        await student.save();

        res.status(200).json({ message: 'Student added successfully!' });
    } catch (error) {
        console.error('Error adding student:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
}


static async createQuiz(req, res) {
    try {
        const { title, description, questions, startTime, endTime } = req.body;

        // Validate input
        if (!title || !questions || questions.length === 0 || !startTime || !endTime) {
            return res.status(400).json({ message: 'All fields are required to create a quiz.' });
        }

        // Ensure start time is before end time
        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({ message: 'Start time must be before end time.' });
        }

        // Create the quiz
        const quiz = new Quiz({
            title,
            description,
            questions,
            startTime,
            endTime,
            createdBy: req.user.id,
        });

        await quiz.save();

        res.status(201).json({ message: 'Quiz created successfully!', quiz });
    } catch (error) {
        console.error('Error creating quiz:', error.message);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
}



static async viewQuizzes(req, res) {
    try {
        const now = new Date();

        // Fetch all quizzes created by the teacher
        const quizzes = await Quiz.find({ createdBy: req.user.id }).select(
            'title description startTime endTime'
        );

        if (quizzes.length === 0) {
            return res.status(404).json({ message: 'No quizzes found.' });
        }

        // Categorize quizzes
        const categorizedQuizzes = {
            running: [],
            upcoming: [],
            ended: [],
        };

        quizzes.forEach((quiz) => {
            if (quiz.startTime <= now && quiz.endTime >= now) {
                categorizedQuizzes.running.push(quiz);
            } else if (quiz.startTime > now) {
                categorizedQuizzes.upcoming.push(quiz);
            } else if (quiz.endTime < now) {
                categorizedQuizzes.ended.push(quiz);
            }
        });

        res.status(200).json(categorizedQuizzes);
    } catch (error) {
        console.error('Error fetching quizzes:', error.message);
        res.status(500).json({ message: 'Server error while fetching quizzes.' });
    }
}

 // View submissions by quiz title or ID
 static async viewSubmissions(req, res) {
    try {
        const { quizTitle, quizId } = req.query; // Accept quizTitle or quizId
        const teacherId = req.user.id;

        let quiz;
        if (quizId) {
            // Find quiz by ID
            quiz = await Quiz.findOne({ _id: quizId, createdBy: teacherId });
        } else if (quizTitle) {
            // Find quiz by title
            quiz = await Quiz.findOne({ title: quizTitle, createdBy: teacherId });
        }

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found or not authorized to view submissions.' });
        }

        // Fetch submissions for the quiz
        const submissions = await Submission.find({ quizId: quiz._id })
            .populate('studentId', 'name email')
            .select('score totalQuestions studentId createdAt');

        if (submissions.length === 0) {
            return res.status(404).json({ message: 'No submissions found for this quiz.' });
        }

        res.status(200).json({ submissions, quiz });
    } catch (error) {
        console.error('Error fetching submissions:', error.message);
        res.status(500).json({ message: 'Server error while fetching submissions.' });
    }
}

}

export default TeacherController;

