// models/Teacher.js
import mongoose from 'mongoose';

const TeacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    associatedStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
    }],
}, { timestamps: true });

export default mongoose.model('Teacher', TeacherSchema);
