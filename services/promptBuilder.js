const buildPrompt = (metrics) => {
  const dataString = JSON.stringify(metrics, null, 2);

  return `
You are an expert executive business analyst for a Boutique CRM.
Your objective is to analyze the following real-time dashboard data and generate a concise executive summary with actionable insights and recommendations for the store managers and sales teams.

=========================================
DATA TO ANALYZE (JSON)
=========================================
${dataString}

=========================================
INSTRUCTIONS
=========================================
1. Analyze the trends based on the provided metrics (revenue, leads, follow-ups, payments, deliveries, and inventory).
2. NEVER simply repeat the raw numbers. Explain what the numbers mean for the business.
3. Identify potential business risks (e.g., high overdue follow-ups, low stock on items, high pending payments).
4. Provide actionable recommendations.
5. Provide a list of priority tasks.
6. Evaluate the overall business health as either "Good", "Fair", or "Critical".
7. You MUST return ONLY a valid JSON object formatted exactly as below. DO NOT include markdown blocks like \`\`\`json.

{
  "businessHealth": "Good | Fair | Critical",
  "summary": "1 short, punchy sentence max (under 20 words).",
  "insights": [
    "Max 10 words per point",
    "Keep it very brief"
  ],
  "recommendations": [
    "Max 10 words per point"
  ],
  "priorityTasks": [
    "Max 10 words per point"
  ]
}
`;
};

module.exports = {
  buildPrompt
};
