import mongoose from 'mongoose'

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, maxlength: 120 },
    template: { type: String, enum: ['classic', 'modern', 'minimal'], default: 'classic' },
    inputData: { type: mongoose.Schema.Types.Mixed, required: true },
    generatedContent: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
)

export default mongoose.model('Resume', resumeSchema)
