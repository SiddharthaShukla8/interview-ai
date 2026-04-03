const pdfParse = require("pdf-parse");

const parsePDF = pdfParse.default || pdfParse;
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * Generate Interview Report
 */
console.log('dekh',pdfParse);
async function generateInterViewReportController(req, res) {
  console.log("Cameeeerrr")
  try {
    let resumeText = "";

    if (req.file) {
      const data = await parsePDF(req.file.buffer);
      resumeText = data.text;
    }

    const { selfDescription, jobDescription } = req.body;

    if (!jobDescription || (!resumeText && !selfDescription)) {
      return res.status(400).json({ message: "Job description, and either Resume or Self Description must be provided" });
    }
    console.log("came")
    // ✅ AI call
    const interViewReportByAi = await generateInterviewReport({
      resume: resumeText,
      selfDescription,
      jobDescription
    });

    // ✅ Save in DB
    const interviewReport = await interviewReportModel.create({
      user: req.user?.id,
      resume: resumeText,
      selfDescription,
      jobDescription,
      ...interViewReportByAi
    });

    res.status(201).json({
      message: "Interview report generated successfully.",
      interviewReport
    });

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
}

/**
 * Get Interview Report by ID
 */
async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params;

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id
    });

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found."
      });
    }

    res.status(200).json({
      message: "Interview report fetched successfully.",
      interviewReport
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Get All Reports
 */
async function getAllInterviewReportsController(req, res) {
  try {
    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("-resume -selfDescription -jobDescription -__v");

    res.status(200).json({
      message: "Interview reports fetched successfully.",
      interviewReports
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Generate Resume PDF
 */
async function generateResumePdfController(req, res) {
  try {
    const { interviewReportId } = req.params;

    const interviewReport = await interviewReportModel.findById(interviewReportId);

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found."
      });
    }

    const { resume, jobDescription, selfDescription } = interviewReport;

    const pdfBuffer = await generateResumePdf({
      resume,
      jobDescription,
      selfDescription
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    });

    res.send(pdfBuffer);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController
};