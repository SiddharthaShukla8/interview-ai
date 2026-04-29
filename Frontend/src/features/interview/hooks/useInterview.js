import { useContext, useEffect } from 'react';
import { useParams } from 'react-router';
import {
    getAllInterviewReports,
    generateInterviewReport,
    getInterviewReportById,
    generateResumePdf,
} from '../services/interview.api';
import { InterviewContext } from '../interview.context';

export const useInterview = () => {
    const context = useContext(InterviewContext);
    const { interviewId } = useParams();

    if (!context) {
        throw new Error('useInterview must be used within an InterviewProvider');
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context;

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true);
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile });
            setReport(response.interviewReport);
            return response;
        } finally {
            setLoading(false);
        }
    };

    const getReportById = async (id) => {
        setLoading(true);
        try {
            const response = await getInterviewReportById(id);
            setReport(response.interviewReport);
            return response.interviewReport;
        } finally {
            setLoading(false);
        }
    };

    const getReports = async () => {
        setLoading(true);
        try {
            const response = await getAllInterviewReports();
            setReports(response.interviewReports || []);
            return response.interviewReports || [];
        } finally {
            setLoading(false);
        }
    };

    const getResumePdf = async (interviewReportId) => {
        setLoading(true);
        try {
            const response = await generateResumePdf({ interviewReportId });
            const url = window.URL.createObjectURL(new Blob([ response ], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `resume_${interviewReportId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                if (interviewId) {
                    await getReportById(interviewId);
                } else {
                    await getReports();
                }
            } catch (_error) {
                if (interviewId) {
                    setReport(null);
                } else {
                    setReports([]);
                }
            }
        };

        loadData();
        // `getReportById` and `getReports` are intentionally defined inline here.
        // Their only external dependency is the stable context setter set.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ interviewId ]);

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf };
};
