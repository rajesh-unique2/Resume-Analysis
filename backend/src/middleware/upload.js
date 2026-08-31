import multer from 'multer'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB, matches the frontend limit

const storage = multer.memoryStorage()

function fileFilter(req, file, cb) {
  if (file.mimetype !== 'application/pdf') {
    cb(new Error('Only PDF files are allowed'))
    return
  }
  cb(null, true)
}

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
})
