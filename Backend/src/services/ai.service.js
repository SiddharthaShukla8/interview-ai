const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const apiKey = process.env.GOOGLE_GENAI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const questionSchema = z.object({
  question: z.string().min(8),
  intention: z.string().min(8),
  answer: z.string().min(12),
});

const skillGapSchema = z.object({
  skill: z.string().min(2),
  severity: z.enum(["low", "medium", "high"]),
});

const preparationPlanSchema = z.object({
  day: z.number(),
  focus: z.string().min(4),
  tasks: z.array(z.string().min(4)).min(2),
});

const interviewReportSchema = z.object({
  matchScore: z.number().describe("A score between 0 and 100 indicating role fit."),
  technicalQuestions: z.array(questionSchema).describe("Technical interview questions."),
  behavioralQuestions: z.array(questionSchema).describe("Behavioral interview questions."),
  skillGaps: z.array(skillGapSchema).describe("Skills to strengthen."),
  preparationPlan: z.array(preparationPlanSchema).describe("Day-wise preparation plan."),
  title: z.string().describe("The most likely role title inferred from the job description."),
});

const resumePdfSchema = z.object({
  html: z.string().describe("A complete HTML resume document."),
});

const STOP_WORDS = new Set([
  "about", "after", "also", "among", "and", "any", "are", "because", "been", "being",
  "build", "built", "candidate", "company", "create", "created", "data", "design", "for",
  "from", "have", "highly", "into", "job", "just", "level", "looking", "must", "need",
  "our", "role", "skills", "software", "team", "that", "their", "them", "they", "this",
  "using", "with", "work", "your",
]);

const TECHNICAL_QUESTION_BANK = {
  frontend: [
    {
      question: (title, keywords) => `How would you structure a scalable frontend architecture for a ${title} experience that depends on ${keywords[0] || "modern web technologies"}?`,
      intention: "The interviewer wants to understand your thinking around maintainable component design, state flow, performance, and long-term ownership.",
      answer: "Explain how you would break the UI into reusable pieces, define state ownership, protect performance with measurement, and add testing, accessibility, and rollout plans from the start.",
    },
    {
      question: (title, keywords) => `What steps would you take to diagnose and improve performance for a ${title} project when ${keywords[1] || "the interface"} becomes slow at scale?`,
      intention: "This checks whether you can move beyond intuition and use profiling, prioritization, and tradeoff analysis to improve real user experience.",
      answer: "Talk through measuring the bottleneck first, reducing unnecessary renders or payload size, improving caching and rendering strategy, and validating the impact with metrics.",
    },
    {
      question: (title, keywords) => `How would you keep a ${title} codebase reliable while adding features related to ${keywords[2] || "complex product requirements"}?`,
      intention: "The interviewer is probing how you balance delivery speed with code health, test coverage, and developer experience.",
      answer: "Describe incremental delivery, contract testing, type safety, linting, pull request discipline, and a refactor strategy that pays down risk while shipping user value.",
    },
    {
      question: (title) => `How do you approach accessibility and inclusive design decisions for a senior-level ${title} role?`,
      intention: "They want to see whether accessibility is part of your default engineering bar rather than a final checklist item.",
      answer: "Share how you build semantic structure, keyboard support, readable contrast, screen reader validation, and cross-device testing into the implementation plan from day one.",
    },
    {
      question: (title, keywords) => `How would you collaborate with backend and product partners when requirements for a ${title} initiative involving ${keywords[3] || "shared APIs"} change late in development?`,
      intention: "The interviewer is evaluating communication, risk management, and your ability to keep delivery aligned under changing constraints.",
      answer: "Frame your answer around surfacing impact early, revisiting scope, aligning on critical paths, updating contracts, and keeping stakeholders informed with concrete options.",
    },
  ],
  backend: [
    {
      question: (title, keywords) => `How would you design a reliable backend service for a ${title} workflow that depends on ${keywords[0] || "high-throughput APIs"}?`,
      intention: "They want to assess your understanding of service boundaries, resilience, observability, and production readiness.",
      answer: "Cover API contracts, validation, storage choices, retries, idempotency, monitoring, and how you would measure success and failure modes in production.",
    },
    {
      question: (title) => `How do you approach database schema design and migrations for a growing ${title} platform?`,
      intention: "This checks whether you can make data-model decisions that support both present requirements and safe future change.",
      answer: "Explain how you model access patterns, preserve backward compatibility, stage migrations, and observe performance before and after rollout.",
    },
    {
      question: (title, keywords) => `What strategies would you use to troubleshoot latency or reliability issues in a ${title} system under peak load?`,
      intention: "The interviewer wants evidence that you can debug distributed systems methodically rather than guessing.",
      answer: "Discuss tracing the request path, checking saturation signals, isolating hotspots, reviewing dependency health, and validating improvements with targeted load tests.",
    },
    {
      question: (title, keywords) => `How would you secure a ${title} API that handles sensitive operations related to ${keywords[1] || "customer data"}?`,
      intention: "They are checking your judgment around authentication, authorization, validation, and operational safeguards.",
      answer: "Walk through auth boundaries, least privilege, input validation, secrets handling, auditability, rate limiting, and secure failure paths.",
    },
    {
      question: (title) => `How do you decide when to refactor a backend component versus iterating on the current design?`,
      intention: "This explores your ability to balance engineering quality, delivery urgency, and future maintainability.",
      answer: "Use a tradeoff-based answer that weighs operational pain, frequency of change, customer impact, and the risk of continuing with the current architecture.",
    },
  ],
  data: [
    {
      question: (title, keywords) => `How would you translate a vague business problem into a measurable analytics plan for a ${title} role?`,
      intention: "The interviewer wants to see whether you can connect stakeholder questions to defensible metrics, datasets, and decision-making.",
      answer: "Describe clarifying the business outcome, defining success metrics, validating data sources, and sequencing analysis so each step leads to an actionable recommendation.",
    },
    {
      question: (title, keywords) => `How do you validate data quality before presenting results that influence ${keywords[0] || "product or business decisions"}?`,
      intention: "This checks your discipline around source trustworthiness, definitions, and reproducibility.",
      answer: "Explain reconciliation checks, anomaly review, documentation of assumptions, and how you communicate confidence levels and known limitations.",
    },
    {
      question: (title) => `What is your process for deciding whether a metric movement is meaningful or just noise?`,
      intention: "The interviewer is evaluating your statistical judgment and your ability to avoid overreacting to weak signals.",
      answer: "Talk about baselines, segmentation, sample size, confounding factors, and how you combine quantitative shifts with business context before recommending action.",
    },
    {
      question: (title, keywords) => `How would you explain a complex analysis to non-technical stakeholders in a ${title} environment?`,
      intention: "They want to know whether your communication style helps teams make decisions instead of just consuming dashboards.",
      answer: "Focus on framing the problem, summarizing the insight in plain language, visualizing only what matters, and closing with clear recommendations and next steps.",
    },
    {
      question: (title, keywords) => `How would you prioritize exploratory analysis versus automation when supporting repeated requests around ${keywords[1] || "reporting"}?`,
      intention: "This question tests whether you can scale your impact rather than remaining stuck in manual work.",
      answer: "Describe when to investigate deeply, when to standardize definitions, and when to operationalize the analysis with dashboards, alerts, or repeatable pipelines.",
    },
  ],
  general: [
    {
      question: (title, keywords) => `What would your first 30 days look like in a ${title} role with emphasis on ${keywords[0] || "delivery and alignment"}?`,
      intention: "The interviewer wants to understand how quickly you can create clarity, build trust, and start contributing in a new environment.",
      answer: "Outline how you would learn context, map stakeholders, identify the highest-value priorities, and produce early wins without overcommitting.",
    },
    {
      question: (title) => `How do you break down an ambiguous problem into an execution plan?`,
      intention: "This question measures structured thinking, prioritization, and your ability to reduce uncertainty for the team.",
      answer: "Explain how you define the outcome, gather constraints, create milestones, and communicate assumptions, risks, and tradeoffs clearly.",
    },
    {
      question: (title, keywords) => `Tell me about a time you had to raise the quality bar for work involving ${keywords[1] || "cross-functional delivery"}.`,
      intention: "They are looking for ownership, judgment, and your ability to lead improvement without waiting for permission.",
      answer: "Use a concrete example with the problem, your actions, the alignment you built, and the measurable result or team impact that followed.",
    },
    {
      question: (title) => `How do you decide what to prioritize when every stakeholder says their request is urgent?`,
      intention: "The interviewer wants evidence that you can make principled decisions under pressure and communicate them well.",
      answer: "Share a framework based on business impact, risk, effort, dependencies, and how you keep tradeoffs transparent so teams can align quickly.",
    },
    {
      question: (title, keywords) => `How would you improve a repeated workflow in a ${title} team that is slowing down delivery?`,
      intention: "This question tests whether you can spot leverage points and turn recurring friction into a scalable improvement.",
      answer: "Describe observing the current process, quantifying the pain, proposing a focused fix, validating adoption, and measuring the efficiency gain afterward.",
    },
  ],
};

const BEHAVIORAL_QUESTION_TEMPLATES = [
  {
    question: (title) => `Tell me about a time you led a difficult cross-functional decision in a ${title} context.`,
    intention: "The interviewer wants to see leadership, influence, and how you navigate ambiguity without losing trust.",
    answer: "Use a STAR structure and emphasize the context, the conflicting priorities, the options you evaluated, and the outcome you drove with clear communication.",
  },
  {
    question: (title) => `Describe a project where the scope changed late and you still delivered strong results.`,
    intention: "This reveals how you manage change, tradeoffs, and stakeholder expectations under pressure.",
    answer: "Focus on how you recalibrated the plan, aligned stakeholders on what changed, protected the critical outcomes, and kept momentum through execution.",
  },
  {
    question: () => "Tell me about a time you received critical feedback and how you responded.",
    intention: "The interviewer is assessing coachability, self-awareness, and whether you can turn feedback into stronger execution.",
    answer: "Choose an example where the feedback was specific, explain what you learned, what you changed, and how the adjustment improved your work or relationships.",
  },
  {
    question: (title) => `Tell me about a time you improved a process or quality bar on your team.`,
    intention: "They want to understand whether you create leverage beyond your immediate task list.",
    answer: "Describe the recurring pain point, how you diagnosed it, what change you introduced, and the measurable impact on reliability, speed, or collaboration.",
  },
  {
    question: (title) => `Describe a time you had to balance speed with quality in a ${title} role.`,
    intention: "This question probes judgment and whether you can make pragmatic decisions without lowering standards carelessly.",
    answer: "Walk through the constraint, how you evaluated risk, what guardrails you kept, and how you followed up to close any temporary quality gaps.",
  },
];

function normalizeWhitespace(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function titleCase(value = "") {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function unique(values) {
  return [ ...new Set(values.filter(Boolean)) ];
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function splitSentences(text = "", limit = 6) {
  return unique(
    text
      .split(/[\n\r]+|(?<=[.?!])\s+/)
      .map((item) => normalizeWhitespace(item))
      .filter((item) => item.length >= 25)
  ).slice(0, limit);
}

function extractKeywords(text = "", limit = 10) {
  const words = normalizeWhitespace(text)
    .toLowerCase()
    .match(/[a-z][a-z0-9+.#-]{2,}/g);

  if (!words) {
    return [];
  }

  const counts = new Map();
  words.forEach((word) => {
    if (STOP_WORDS.has(word)) {
      return;
    }
    counts.set(word, (counts.get(word) || 0) + 1);
  });

  return [ ...counts.entries() ]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([ word ]) => word);
}

function inferTitle(jobDescription = "") {
  const lines = jobDescription
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const firstLine = lines[0] || "";
  const roleMatch = firstLine.match(
    /\b((senior|staff|lead|principal|junior)?\s*(software engineer|frontend engineer|backend engineer|full stack engineer|data analyst|data scientist|product manager|designer|developer|analyst))\b/i
  );

  if (roleMatch) {
    return titleCase(roleMatch[1]);
  }

  if (firstLine.length > 0 && firstLine.length <= 80) {
    return titleCase(firstLine.replace(/\bat\s+.+$/i, ""));
  }

  return "Target Role";
}

function classifyRole(text = "") {
  const normalized = text.toLowerCase();

  if (/(frontend|react|javascript|typescript|ui|web|css)/.test(normalized)) {
    return "frontend";
  }

  if (/(backend|api|node|java|spring|database|microservice|server)/.test(normalized)) {
    return "backend";
  }

  if (/(data analyst|analytics|analyst|sql|tableau|power bi|python|experiment|metric)/.test(normalized)) {
    return "data";
  }

  return "general";
}

function inferMatchScore(jobKeywords, profileKeywords, hasResume, hasSelfDescription) {
  const overlapCount = jobKeywords.filter((keyword) => profileKeywords.includes(keyword)).length;
  const overlapRatio = jobKeywords.length ? overlapCount / jobKeywords.length : 0.45;
  const signalBonus = Math.min(profileKeywords.length, 6) * 2;
  const completenessBonus = (hasResume ? 6 : 0) + (hasSelfDescription ? 4 : 0);
  const score = 50 + overlapRatio * 28 + signalBonus + completenessBonus;

  return clamp(Math.round(score), 42, 96);
}

function buildTechnicalQuestions(roleType, title, jobKeywords) {
  const bank = TECHNICAL_QUESTION_BANK[roleType] || TECHNICAL_QUESTION_BANK.general;
  return bank.slice(0, 5).map((item) => ({
    question: item.question(title, jobKeywords),
    intention: item.intention,
    answer: item.answer,
  }));
}

function buildBehavioralQuestions(title) {
  return BEHAVIORAL_QUESTION_TEMPLATES.slice(0, 5).map((item) => ({
    question: item.question(title),
    intention: item.intention,
    answer: item.answer,
  }));
}

function buildSkillGaps(jobKeywords, profileKeywords) {
  const missing = jobKeywords.filter((keyword) => !profileKeywords.includes(keyword));
  const fallbackList = missing.length > 0 ? missing : jobKeywords;
  const severities = [ "high", "medium", "medium", "low" ];

  return fallbackList.slice(0, 4).map((keyword, index) => ({
    skill: titleCase(keyword),
    severity: severities[index] || "low",
  }));
}

function buildPreparationPlan(title, jobKeywords, skillGaps) {
  const primaryGap = skillGaps[0]?.skill || title;
  const secondaryGap = skillGaps[1]?.skill || titleCase(jobKeywords[0] || "Role Fundamentals");

  return [
    {
      day: 1,
      focus: `${title} role alignment`,
      tasks: [
        "Break the job description into must-have skills, business goals, and interview signals.",
        "Write a short introduction that connects your background to the role with clear evidence.",
        "List two recent projects or wins that best demonstrate your fit for the position.",
      ],
    },
    {
      day: 2,
      focus: `${primaryGap} foundations`,
      tasks: [
        `Review the core concepts behind ${primaryGap} and capture concise talking points.`,
        "Prepare one example that shows how you applied similar skills in a real project.",
        "Write down common mistakes or tradeoffs you would mention in an interview answer.",
      ],
    },
    {
      day: 3,
      focus: `${secondaryGap} deep practice`,
      tasks: [
        `Practice explaining ${secondaryGap} using concrete examples, not only definitions.`,
        "Turn one project into a walkthrough that highlights decisions, risks, and outcomes.",
        "Summarize the strongest technical or analytical lessons you would bring into this role.",
      ],
    },
    {
      day: 4,
      focus: "Mock interview rehearsal",
      tasks: [
        "Answer at least five technical questions out loud and refine weak explanations.",
        "Tighten any stories that ramble or do not clearly show impact and ownership.",
        "Track repeat follow-up questions so you can prepare stronger second-level answers.",
      ],
    },
    {
      day: 5,
      focus: "Behavioral story bank",
      tasks: [
        "Prepare STAR stories for leadership, conflict, failure, ambiguity, and fast delivery.",
        "Add numbers, scope, and outcomes so each story feels credible and memorable.",
        "Practice linking each story back to the role requirements in one closing sentence.",
      ],
    },
    {
      day: 6,
      focus: "Resume and talking-point polish",
      tasks: [
        "Align your resume bullets and introduction with the strongest role requirements.",
        "Trim vague language and replace it with impact, ownership, and business outcomes.",
        "Prepare two thoughtful questions that show strategic interest in the team and role.",
      ],
    },
    {
      day: 7,
      focus: "Final confidence pass",
      tasks: [
        "Run a timed mock interview from introduction through closing questions.",
        "Revisit any weak concepts one last time and keep your notes concise.",
        "Get rest and keep a short pre-interview checklist for logistics, mindset, and key examples.",
      ],
    },
  ];
}

function buildFallbackInterviewReport({ resume = "", selfDescription = "", jobDescription = "" }) {
  const title = inferTitle(jobDescription);
  const roleType = classifyRole(`${title} ${jobDescription}`);
  const jobKeywords = extractKeywords(jobDescription, 10);
  const profileKeywords = extractKeywords(`${resume} ${selfDescription}`, 10);
  const technicalQuestions = buildTechnicalQuestions(roleType, title, jobKeywords);
  const behavioralQuestions = buildBehavioralQuestions(title);
  const skillGaps = buildSkillGaps(jobKeywords, profileKeywords);
  const preparationPlan = buildPreparationPlan(title, jobKeywords, skillGaps);

  return {
    title,
    matchScore: inferMatchScore(jobKeywords, profileKeywords, Boolean(resume), Boolean(selfDescription)),
    technicalQuestions,
    behavioralQuestions,
    skillGaps,
    preparationPlan,
  };
}

function sanitizeQuestion(item, fallback) {
  return {
    question: normalizeWhitespace(item?.question) || fallback.question,
    intention: normalizeWhitespace(item?.intention) || fallback.intention,
    answer: normalizeWhitespace(item?.answer) || fallback.answer,
  };
}

function sanitizeSkillGap(item, fallback) {
  const severity = [ "low", "medium", "high" ].includes(item?.severity) ? item.severity : fallback.severity;

  return {
    skill: normalizeWhitespace(item?.skill) || fallback.skill,
    severity,
  };
}

function sanitizePreparationDay(item, fallback) {
  const tasks = Array.isArray(item?.tasks)
    ? unique(item.tasks.map((task) => normalizeWhitespace(task)).filter((task) => task.length >= 4)).slice(0, 5)
    : [];

  return {
    day: Number.isFinite(Number(item?.day)) ? clamp(Number(item.day), 1, 30) : fallback.day,
    focus: normalizeWhitespace(item?.focus) || fallback.focus,
    tasks: tasks.length >= 2 ? tasks : fallback.tasks,
  };
}

function normalizeInterviewReport(rawReport, fallbackReport) {
  const technicalQuestions = fallbackReport.technicalQuestions.map((fallback, index) =>
    sanitizeQuestion(rawReport?.technicalQuestions?.[index], fallback)
  );
  const behavioralQuestions = fallbackReport.behavioralQuestions.map((fallback, index) =>
    sanitizeQuestion(rawReport?.behavioralQuestions?.[index], fallback)
  );
  const skillGaps = fallbackReport.skillGaps.map((fallback, index) =>
    sanitizeSkillGap(rawReport?.skillGaps?.[index], fallback)
  );
  const preparationPlan = fallbackReport.preparationPlan.map((fallback, index) =>
    sanitizePreparationDay(rawReport?.preparationPlan?.[index], fallback)
  );

  const parsedScore = Number(rawReport?.matchScore);

  return {
    title: normalizeWhitespace(rawReport?.title) || fallbackReport.title,
    matchScore: Number.isFinite(parsedScore) ? clamp(Math.round(parsedScore), 0, 100) : fallbackReport.matchScore,
    technicalQuestions,
    behavioralQuestions,
    skillGaps,
    preparationPlan,
  };
}

function buildSummary(resume, selfDescription, jobDescription) {
  const sourceSentences = splitSentences(`${selfDescription}\n${resume}`, 3);
  const jobSignals = splitSentences(jobDescription, 2);
  const summary = [ ...sourceSentences, ...jobSignals ]
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean)
    .slice(0, 3)
    .join(" ");

  return summary || "Adaptable professional with relevant experience and a focus on delivering measurable outcomes.";
}

function ensureHtmlDocument(html, title) {
  const trimmed = String(html || "").trim();

  if (/<!doctype html>|<html[\s>]/i.test(trimmed)) {
    return trimmed;
  }

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body>${trimmed}</body>
</html>`;
}

function buildResumeHtml({ resume = "", selfDescription = "", jobDescription = "" }) {
  const title = inferTitle(jobDescription);
  const summary = buildSummary(resume, selfDescription, jobDescription);
  const profileHighlights = splitSentences(`${resume}\n${selfDescription}`, 5);
  const roleSignals = splitSentences(jobDescription, 4);
  const strengths = unique([
    ...extractKeywords(`${resume} ${selfDescription}`, 6),
    ...extractKeywords(jobDescription, 4),
  ])
    .slice(0, 8)
    .map((item) => titleCase(item));

  const highlightItems = profileHighlights.length > 0
    ? profileHighlights
    : [
        "Delivered work across cross-functional environments and adapted quickly to new requirements.",
        "Demonstrated ownership, communication, and problem-solving in fast-moving delivery contexts.",
      ];

  const alignmentItems = roleSignals.length > 0
    ? roleSignals
    : [
        "Aligned previous work to the role's top requirements and expected business outcomes.",
        "Prepared concise examples that demonstrate ownership, judgment, and measurable impact.",
      ];

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} Resume</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Avenir Next", "Segoe UI", Arial, sans-serif;
        background: #f6f7fb;
        color: #142033;
      }
      .page {
        max-width: 860px;
        margin: 0 auto;
        padding: 36px 42px 40px;
        background: #ffffff;
      }
      .hero {
        padding: 20px 24px;
        border-radius: 24px;
        background: linear-gradient(135deg, #142033 0%, #283c63 100%);
        color: #ffffff;
      }
      .eyebrow {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.14);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      h1 {
        margin: 14px 0 6px;
        font-size: 32px;
        line-height: 1.1;
      }
      .subtitle {
        margin: 0;
        color: rgba(255, 255, 255, 0.82);
        font-size: 15px;
        line-height: 1.6;
      }
      .grid {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 24px;
        margin-top: 28px;
      }
      .card {
        border: 1px solid #d8dfec;
        border-radius: 20px;
        padding: 18px 20px;
        background: #ffffff;
      }
      .card h2 {
        margin: 0 0 12px;
        font-size: 16px;
        letter-spacing: 0.02em;
      }
      p, li {
        font-size: 13.5px;
        line-height: 1.65;
        color: #334155;
      }
      ul {
        margin: 0;
        padding-left: 18px;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .chip {
        padding: 7px 12px;
        border-radius: 999px;
        background: #eef2ff;
        color: #3730a3;
        font-size: 12px;
        font-weight: 700;
      }
      .section {
        margin-top: 24px;
      }
      .section h2 {
        margin: 0 0 12px;
        font-size: 16px;
      }
      .muted {
        color: #64748b;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <section class="hero">
        <div class="eyebrow">Targeted Resume</div>
        <h1>${escapeHtml(title)}</h1>
        <p class="subtitle">${escapeHtml(summary)}</p>
      </section>

      <section class="grid">
        <div class="card">
          <h2>Professional Summary</h2>
          <p>${escapeHtml(summary)}</p>
        </div>
        <div class="card">
          <h2>Core Strengths</h2>
          <div class="chips">
            ${strengths.map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join("")}
          </div>
        </div>
      </section>

      <section class="section">
        <h2>Experience Highlights</h2>
        <ul>
          ${highlightItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>

      <section class="section">
        <h2>Role Alignment</h2>
        <ul>
          ${alignmentItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>

      <section class="section">
        <h2>Interview Positioning Notes</h2>
        <p class="muted">Use this resume alongside the interview plan to keep your examples focused on measurable outcomes, ownership, technical depth, and cross-functional collaboration.</p>
      </section>
    </div>
  </body>
</html>`;
}

async function requestStructuredContent(prompt, schema) {
  if (!ai) {
    throw new Error("Google GenAI API key is not configured.");
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(schema),
    },
  });

  if (!response.text) {
    throw new Error("Empty AI response.");
  }

  return JSON.parse(response.text);
}

async function generateInterviewReport({ resume = "", selfDescription = "", jobDescription = "" }) {
  const fallbackReport = buildFallbackInterviewReport({ resume, selfDescription, jobDescription });
  const warnings = [];

  const prompt = `You are creating a polished interview preparation report.

Return JSON only.
Keep all fields populated, concrete, and tailored to the candidate.
Use concise but useful answers.

Candidate resume:
${resume || "Not provided"}

Candidate self description:
${selfDescription || "Not provided"}

Target job description:
${jobDescription}`;

  try {
    const aiReport = await requestStructuredContent(prompt, interviewReportSchema);
    return {
      report: normalizeInterviewReport(aiReport, fallbackReport),
      meta: {
        mode: "ai",
        warnings,
      },
    };
  } catch (error) {
    warnings.push("AI generation was unavailable, so a professional starter plan was created from the information you provided.");

    return {
      report: fallbackReport,
      meta: {
        mode: "fallback",
        warnings,
        error: error.message,
      },
    };
  }
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [ "--no-sandbox", "--disable-setuid-sandbox" ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
    await page.emulateMediaType("screen");

    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "18mm",
        bottom: "18mm",
        left: "14mm",
        right: "14mm",
      },
    });
  } finally {
    await browser.close();
  }
}

async function generateResumePdf({ resume = "", selfDescription = "", jobDescription = "" }) {
  const fallbackHtml = buildResumeHtml({ resume, selfDescription, jobDescription });
  const prompt = `Create a clean, ATS-friendly HTML resume for the following candidate.

Return JSON only with a single "html" field that contains a complete HTML document.
Use simple professional styling, no external assets, and keep the layout within 1 to 2 pages.

Candidate resume:
${resume || "Not provided"}

Candidate self description:
${selfDescription || "Not provided"}

Target job description:
${jobDescription}`;

  let htmlDocument = fallbackHtml;

  try {
    const aiResume = await requestStructuredContent(prompt, resumePdfSchema);
    const candidateHtml = normalizeWhitespace(aiResume?.html) ? aiResume.html : fallbackHtml;
    htmlDocument = ensureHtmlDocument(candidateHtml, inferTitle(jobDescription));
  } catch (_error) {
    htmlDocument = fallbackHtml;
  }

  return generatePdfFromHtml(htmlDocument);
}

module.exports = { generateInterviewReport, generateResumePdf };
