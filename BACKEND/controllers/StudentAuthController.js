import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';

class StudentAuthController {
    // Register a student
    static async register(req, res) {
        const { name, email, password } = req.body;

        try {
            // Check if the email is already registered
            const existingStudent = await Student.findOne({ email: email.toLowerCase() });
            if (existingStudent) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered.',
                });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new student
            const student = new Student({
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
            });
            await student.save();

            res.status(201).json({
                success: true,
                message: 'Student registered successfully!',
                data: { id: student._id, name: student.name, email: student.email },
            });
        } catch (error) {
            console.error('Error registering student:', error.message);
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again later.',
            });
        }
    }

    // Login a student
    static async login(req, res) {
        const { email, password } = req.body;

        try {
            // Find student by email
            const student = await Student.findOne({ email: email.toLowerCase() });
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found.',
                });
            }

            // Compare passwords
            const isMatch = await bcrypt.compare(password, student.password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid credentials.',
                });
            }

            // Generate a JWT token
            const token = jwt.sign(
                { id: student._id, role: 'student' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({
                success: true,
                message: 'Login successful!',
                token,
            });
        } catch (error) {
            console.error('Error logging in student:', error.message);
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again later.',
            });
        }
    }
}

export default StudentAuthController;
