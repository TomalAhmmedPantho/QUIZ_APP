import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    choices: [
        {
            text: { type: String, required: true },
            isCorrect: { type: Boolean, required: true, default: false },
        },
    ],
});

const QuizSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, maxlength: 100 },
        description: { type: String, maxlength: 500 },
        questions: [QuestionSchema],
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    },
    { timestamps: true }
);

export default mongoose.model('Quiz', QuizSchema);
