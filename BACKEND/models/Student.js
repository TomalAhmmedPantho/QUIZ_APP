// models/Student.js
import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
    {
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
        associatedTeachers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Teacher',
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model('Student', StudentSchema);
