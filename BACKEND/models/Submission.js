import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema(
    {
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        answers: [
            {
                questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
                selectedChoice: { type: String, required: true },
            },
        ],
        score: { type: Number, required: true },
        totalQuestions: { type: Number, required: true },
    },
    { timestamps: true }
);

export default mongoose.model('Submission', SubmissionSchema);
