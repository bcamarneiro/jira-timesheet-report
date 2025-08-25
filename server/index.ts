import express from 'express';
import cors from 'cors';

import * as dotenv from 'dotenv';
dotenv.config();

import { fetchIssues, fetchWorklogs } from './jira';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/timesheet', async (req, res) => {
  try {
    const now = new Date();
    const yearParam = Number.parseInt((req.query.year as string) || '', 10);
    const monthParam = Number.parseInt((req.query.month as string) || '', 10);
    const year = Number.isFinite(yearParam) && yearParam > 1900 ? yearParam : now.getUTCFullYear();
    const monthOneBased = Number.isFinite(monthParam) && monthParam >= 1 && monthParam <= 12 ? monthParam : (now.getUTCMonth() + 1);

    const { keys, summaries } = await fetchIssues(year, monthOneBased);
    const data = await fetchWorklogs(keys, year, monthOneBased);
    res.json({
      jiraDomain: process.env.JIRA_DOMAIN,
      worklogs: data,
      issueSummaries: summaries,
      teamDevelopers: (process.env.TEAM_DEVELOPERS || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    });
  } catch (err) {
    console.error("Error processing request:", err); // Log the error for debugging
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(3000, () => {
  console.log('API server running on http://localhost:3000');
});
