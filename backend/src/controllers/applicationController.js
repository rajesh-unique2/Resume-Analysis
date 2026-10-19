import Application from '../models/Application.js'

const statuses = ['Saved', 'Applied', 'Screening', 'Interview', 'Offer', 'Rejected']

function payload(body) {
  return {
    company: body.company?.trim(),
    jobTitle: body.jobTitle?.trim(),
    jobUrl: body.jobUrl?.trim() || '',
    appliedAt: body.appliedAt || undefined,
    status: statuses.includes(body.status) ? body.status : 'Saved',
    interviewAt: body.interviewAt || undefined,
    notes: body.notes?.trim() || '',
    resumeVersion: body.resumeVersion?.trim() || '',
  }
}

export async function listApplications(req, res) {
  const records = await Application.find({ userId: req.userId }).sort({ updatedAt: -1 }).limit(100)
  res.json(records)
}

export async function createApplication(req, res) {
  const data = payload(req.body)
  if (!data.company || !data.jobTitle) {
    return res.status(400).json({ message: 'Company and job title are required.' })
  }
  const record = await Application.create({ ...data, userId: req.userId })
  res.status(201).json(record)
}

export async function updateApplication(req, res) {
  const record = await Application.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    payload(req.body),
    { new: true, runValidators: true }
  )
  if (!record) return res.status(404).json({ message: 'Application not found.' })
  res.json(record)
}

export async function deleteApplication(req, res) {
  const record = await Application.findOneAndDelete({ _id: req.params.id, userId: req.userId })
  if (!record) return res.status(404).json({ message: 'Application not found.' })
  res.json({ id: req.params.id })
}
