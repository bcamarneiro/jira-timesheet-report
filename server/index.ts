import express from 'express';
import cors from 'cors';

import * as dotenv from 'dotenv';
dotenv.config();

import { fetchIssues, fetchWorklogs } from './jira';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/timesheet', async (req, res) => {
  try {
    const now = new Date();
    const yearParam = Number.parseInt((req.query.year as string) || '', 10);
    const monthParam = Number.parseInt((req.query.month as string) || '', 10);
    const year = Number.isFinite(yearParam) && yearParam > 1900 ? yearParam : now.getUTCFullYear();
    const monthOneBased = Number.isFinite(monthParam) && monthParam >= 1 && monthParam <= 12 ? monthParam : (now.getUTCMonth() + 1);

    // Get configuration from request body
    const { projectConfig = {}, personalConfig = {} } = req.body || {};
    
    // Validate required configuration
    if (!personalConfig.jiraPat) {
      return res.status(400).json({ error: 'JIRA Personal Access Token is required' });
    }
    if (!projectConfig.jiraDomain) {
      return res.status(400).json({ error: 'JIRA Domain is required' });
    }

    const jiraComponents = projectConfig.jiraComponents || [];
    const teamDevelopers = projectConfig.teamDevelopers || [];

    // Pass configuration to JIRA services
    const jiraConfig = {
      domain: projectConfig.jiraDomain,
      pat: personalConfig.jiraPat,
      components: jiraComponents,
      teamDevelopers: teamDevelopers
    };

    const { keys, summaries } = await fetchIssues(year, monthOneBased, jiraConfig);
    const data = await fetchWorklogs(keys, year, monthOneBased, jiraConfig);
    
    res.json({
      jiraDomain: projectConfig.jiraDomain,
      worklogs: data,
      issueSummaries: summaries,
      teamDevelopers: teamDevelopers
    });
  } catch (err) {
    console.error("Error processing request:", err); // Log the error for debugging
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(3000, () => {
  console.log('API server running on http://localhost:3000');
});
