import express from 'express';
import cors from 'cors';

import * as dotenv from 'dotenv';
dotenv.config();

import { fetchIssues, fetchWorklogs } from './jiraClient';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/timesheet', async (req, res) => {
  try {
    const issues = await fetchIssues();
    const data = await fetchWorklogs(issues);
    res.json({
      jiraDomain: process.env.JIRA_DOMAIN,
      worklogs: data
    });
  } catch (err) {
    console.error("Error processing request:", err); // Log the error for debugging
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(3000, () => {
  console.log('API server running on http://localhost:3000');
});
