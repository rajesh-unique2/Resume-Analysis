import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, maxlength: 500 },
    answer: { type: String, required: true, maxlength: 4000 },
  },
  { _id: false }
)

const communicationAssessmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    answers: { type: [answerSchema], required: true },
    categoryScores: {
      grammar: { type: Number, required: true, min: 0, max: 100 },
      vocabulary: { type: Number, required: true, min: 0, max: 100 },
      fluency: { type: Number, required: true, min: 0, max: 100 },
      clarity: { type: Number, required: true, min: 0, max: 100 },
      relevance: { type: Number, required: true, min: 0, max: 100 },
    },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    strengths: [{ type: String, maxlength: 300 }],
    grammarCorrections: [
      {
        original: { type: String, maxlength: 500 },
        corrected: { type: String, maxlength: 500 },
      },
    ],
    vocabularySuggestions: [{ type: String, maxlength: 500 }],
    recommendations: [{ type: String, maxlength: 500 }],
    improvedAnswers: [{ type: String, maxlength: 1000 }],
  },
  { timestamps: true }
)

export default mongoose.model('CommunicationAssessment', communicationAssessmentSchema)
