import mongoose from 'mongoose'

const analysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true },
    jobDescription: { type: String, required: true },
    resumeText: { type: String, required: true },
    score: { type: Number, required: true },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    feedback: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.model('Analysis', analysisSchema)