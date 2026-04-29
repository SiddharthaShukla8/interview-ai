const pdfParse = require("pdf-parse");

const parsePDF = pdfParse.default || pdfParse;
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function generateInterViewReportController(req, res, next) {
  try {
    const { selfDescription = "", jobDescription = "" } = req.body;
    const warnings = [];
    let resumeText = "";

    if (!jobDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job description is required.",
      });
    }

    if (req.file) {
      try {
        const data = await parsePDF(req.file.buffer);
        resumeText = data.text?.trim() || "";

        if (!resumeText) {
          warnings.push("The uploaded resume had very little readable text, so the report relied more heavily on your self-description.");
        }
      } catch (_error) {
        if (!selfDescription.trim()) {
          return res.status(400).json({
            success: false,
            message: "We could not read the uploaded resume. Please upload a text-based PDF or add a self-description.",
          });
        }

        warnings.push("We could not fully read the uploaded resume, so the report was generated from the text we could use.");
      }
    }

    if (!resumeText && !selfDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: "Add either a readable PDF resume or a self-description to generate a report.",
      });
    }

    const { report, meta } = await generateInterviewReport({
      resume: resumeText,
      selfDescription,
      jobDescription,
    });

    const interviewReport = await interviewReportModel.create({
      user: req.user?.id,
      resume: resumeText,
      selfDescription,
      jobDescription,
      ...report,
    });

    res.status(201).json({
      success: true,
      message: "Interview report generated successfully.",
      interviewReport,
      warnings: [ ...warnings, ...(meta?.warnings || []) ],
      generationMode: meta?.mode || "ai",
    });
  } catch (error) {
    next(error);
  }
}

async function getInterviewReportByIdController(req, res, next) {
  try {
    const { interviewId } = req.params;

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({
        success: false,
        message: "Interview report not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview report fetched successfully.",
      interviewReport,
    });
  } catch (error) {
    next(error);
  }
}

async function getAllInterviewReportsController(req, res, next) {
  try {
    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("-resume -selfDescription -jobDescription -__v");

    res.status(200).json({
      success: true,
      message: "Interview reports fetched successfully.",
      interviewReports,
    });
  } catch (error) {
    next(error);
  }
}

async function generateResumePdfController(req, res, next) {
  try {
    const { interviewReportId } = req.params;

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewReportId,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({
        success: false,
        message: "Interview report not found.",
      });
    }

    const pdfBuffer = await generateResumePdf({
      resume: interviewReport.resume,
      jobDescription: interviewReport.jobDescription,
      selfDescription: interviewReport.selfDescription,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
    });

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
