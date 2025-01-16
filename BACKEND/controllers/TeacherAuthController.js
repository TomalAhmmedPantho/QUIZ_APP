import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Teacher from '../models/Teacher.js';

class TeacherAuthController {
    // Register a teacher
    static async register(req, res) {
        const { name, email, password, subject } = req.body;

        try {
            // Check if the email is already registered
            const existingTeacher = await Teacher.findOne({ email: email.toLowerCase() });
            if (existingTeacher) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered.',
                });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new teacher
            const teacher = new Teacher({
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                subject,
            });
            await teacher.save();

            res.status(201).json({
                success: true,
                message: 'Teacher registered successfully!',
                data: { id: teacher._id, name: teacher.name, email: teacher.email },
            });
        } catch (error) {
            console.error('Error registering teacher:', error.message);
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again later.',
            });
        }
    }

    // Login a teacher
    static async loginTeacher(req, res) {
        const { email, password } = req.body;

        try {
            // Find teacher by email
            const teacher = await Teacher.findOne({ email: email.toLowerCase() });
            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: 'Teacher not found.',
                });
            }

            // Compare passwords
            const isMatch = await bcrypt.compare(password, teacher.password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid credentials.',
                });
            }

            // Generate a JWT token
            const token = jwt.sign(
                { id: teacher._id, role: 'teacher' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({
                success: true,
                message: 'Login successful!',
                token,
            });
        } catch (error) {
            console.error('Error logging in teacher:', error.message);
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again later.',
            });
        }
    }
}

export default TeacherAuthController;
