import mongoose from 'mongoose'

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    company: { type: String, required: true, trim: true, maxlength: 120 },
    jobTitle: { type: String, required: true, trim: true, maxlength: 160 },
    jobUrl: { type: String, trim: true, maxlength: 500 },
    appliedAt: { type: Date },
    status: {
      type: String,
      enum: ['Saved', 'Applied', 'Screening', 'Interview', 'Offer', 'Rejected'],
      default: 'Saved',
    },
    interviewAt: { type: Date },
    notes: { type: String, maxlength: 4000 },
    resumeVersion: { type: String, maxlength: 120 },
  },
  { timestamps: true }
)

export default mongoose.model('Application', applicationSchema)
