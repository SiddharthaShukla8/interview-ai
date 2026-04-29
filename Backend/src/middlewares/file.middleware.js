const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const isPdfMime = file.mimetype === "application/pdf";
    const isPdfName = file.originalname?.toLowerCase().endsWith(".pdf");

    if (isPdfMime || isPdfName) {
      return cb(null, true);
    }

    const error = new Error("Please upload a PDF resume.");
    error.code = "UNSUPPORTED_FILE_TYPE";
    return cb(error);
  },
});

module.exports = upload;
