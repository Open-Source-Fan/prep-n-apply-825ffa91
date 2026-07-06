import { jsPDF } from "jspdf";

type PerQ = {
  question: string;
  category?: string;
  score: number;
  llmScore?: number;
  ruleScore?: number;
  contentRelevance?: number;
  starScore?: number;
  keywordCoverage?: number;
  feedback: string;
};

export type ReportData = {
  overall: number;
  readinessLevel: string;
  summary: string;
  competencies: { name: string; score: number }[];
  strengths: string[];
  weaknesses: string[];
  perQuestion: PerQ[];
  scoring?: { llmAverage: number; ruleAverage: number; weights: { llm: number; rule: number } };
};

export type ReportMeta = {
  jobTitle: string;
  company?: string | null;
  interviewType?: string | null;
  difficulty?: string | null;
  date?: string | null;
};

// Deterministic RGB colors (avoid oklch — jsPDF needs plain RGB).
const INK: [number, number, number] = [30, 41, 59];
const MUTED: [number, number, number] = [100, 116, 139];
const ACCENT: [number, number, number] = [13, 148, 136];

function scoreColor(s: number): [number, number, number] {
  if (s >= 75) return [22, 163, 74];
  if (s >= 50) return [217, 119, 6];
  return [220, 38, 38];
}

export function downloadReportPdf(report: ReportData, meta: ReportMeta) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = margin;

  const ensure = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const text = (
    str: string,
    size: number,
    opts: { color?: [number, number, number]; bold?: boolean; gap?: number; x?: number; maxW?: number } = {},
  ) => {
    const { color = INK, bold = false, gap = 6, x = margin, maxW = contentW } = opts;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(str, maxW);
    for (const line of lines) {
      ensure(size + 2);
      doc.text(line, x, y);
      y += size + 2;
    }
    y += gap;
  };

  const rule = () => {
    ensure(12);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageW - margin, y);
    y += 14;
  };

  // Header
  text("Interview Readiness Report", 22, { bold: true, gap: 2 });
  text(
    `${meta.jobTitle}${meta.company ? ` · ${meta.company}` : ""}`,
    12,
    { color: MUTED, gap: 2 },
  );
  const sub = [meta.interviewType, meta.difficulty, meta.date ? new Date(meta.date).toLocaleDateString() : null]
    .filter(Boolean)
    .join("  ·  ");
  if (sub) text(sub, 10, { color: MUTED });
  rule();

  // Overall score + readiness
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.setTextColor(...ACCENT);
  ensure(48);
  doc.text(`${Math.round(report.overall)}%`, margin, y + 30);
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text(report.readinessLevel, margin + 110, y + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text("Overall readiness score", margin + 110, y + 32);
  y += 56;
  text(report.summary, 11, { gap: 10 });
  rule();

  // Hybrid scoring breakdown
  if (report.scoring) {
    text("Hybrid Scoring Breakdown", 14, { bold: true, gap: 4 });
    text(`LLM quality  ${report.scoring.llmAverage}%   (weight ${Math.round(report.scoring.weights.llm * 100)}%)`, 11, { gap: 2 });
    text(`Rule-based  ${report.scoring.ruleAverage}%   (weight ${Math.round(report.scoring.weights.rule * 100)}%)`, 11, { gap: 2 });
    text(`Composite (blended)  ${Math.round(report.overall)}%`, 11, { bold: true, gap: 10 });
    rule();
  }

  // Competency breakdown as labeled bars
  text("Competency Breakdown", 14, { bold: true, gap: 6 });
  const barX = margin + 150;
  const barW = contentW - 150 - 40;
  for (const c of report.competencies) {
    ensure(20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(doc.splitTextToSize(c.name, 140)[0], margin, y + 9);
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(barX, y, barW, 8, 4, 4, "F");
    doc.setFillColor(...scoreColor(c.score));
    doc.roundedRect(barX, y, Math.max(4, (barW * c.score) / 100), 8, 4, 4, "F");
    doc.setTextColor(...MUTED);
    doc.text(`${c.score}%`, barX + barW + 8, y + 9);
    y += 20;
  }
  y += 8;
  rule();

  // Strengths / weaknesses
  text("Strengths", 14, { bold: true, color: [22, 163, 74], gap: 4 });
  if (report.strengths?.length) report.strengths.forEach((s) => text(`•  ${s}`, 11, { gap: 2 }));
  else text("No standout strengths detected.", 11, { color: MUTED });
  y += 4;
  text("Weaknesses", 14, { bold: true, color: [220, 38, 38], gap: 4 });
  if (report.weaknesses?.length) report.weaknesses.forEach((s) => text(`•  ${s}`, 11, { gap: 2 }));
  else text("No major weaknesses detected.", 11, { color: MUTED });
  rule();

  // Per-question breakdown
  text("Question-by-Question Breakdown", 14, { bold: true, gap: 8 });
  report.perQuestion.forEach((q, i) => {
    ensure(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...scoreColor(q.score));
    doc.text(`${q.score}%`, margin, y);
    text(`Q${i + 1}: ${q.question}`, 11, { bold: true, x: margin + 44, maxW: contentW - 44, gap: 3 });
    if (q.feedback) text(q.feedback, 10, { color: MUTED, x: margin + 44, maxW: contentW - 44, gap: 3 });
    const chips = [
      q.llmScore != null ? `LLM ${q.llmScore}%` : null,
      q.ruleScore != null ? `Rule ${q.ruleScore}%` : null,
      q.contentRelevance != null ? `Relevance ${q.contentRelevance}%` : null,
      q.keywordCoverage != null ? `Keywords ${q.keywordCoverage}%` : null,
    ].filter(Boolean);
    if (chips.length) text(chips.join("   "), 9, { color: MUTED, x: margin + 44, maxW: contentW - 44, gap: 10 });
  });

  const safe = meta.jobTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`readiness-report-${safe}.pdf`);
}
