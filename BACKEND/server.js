import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';

import teacherAuthRoutes from './routes/teacherAuthRoutes.js';
import studentAuthRoutes from './routes/studentAuthRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import Student from './models/Student.js';
import studentRoutes from './routes/studentRoutes.js';
import quizRoutes from './routes/quizRoutes.js';

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());

// Configure CORS
app.use(
    cors({
        origin: ['http://localhost:5000', 'http://127.0.0.1:5500'], // Restrict origins
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true, // Allow cookies
    })
);

// Serve static files from the FRONTEND folder
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'FRONTEND')));

// Database connection
const connectDB = async (DATABASE_URL) => {
    try {
        const DB_OPTIONS = { dbname: 'QUIZPOINT' };
        await mongoose.connect(DATABASE_URL, DB_OPTIONS);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};
connectDB(process.env.DATABASE_URL);

// Routes
app.use('/api/teacher/auth', teacherAuthRoutes);
app.use('/api/student/auth', studentAuthRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
// Use quiz routes
app.use('/api', quizRoutes);

// Handle unmatched routes for frontend
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next(); // Pass API routes to the next middleware
    }
    res.sendFile(path.join(__dirname, 'FRONTEND', 'index.html'));
});

// 404 handler for API routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
