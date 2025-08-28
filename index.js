// ========= CONFIGS ==========
// create PAT in Jira: https://ticket.rsint.net/secure/ViewProfile.jspa?selectedTab=com.atlassian.pats.pats-plugin:jira-user-personal-access-tokens
// NOTE: Do not hardcode tokens. Use environment variables instead.
const PAT = process.env.JIRA_PAT || '';
const userName = process.env.USER_FILTER || '';

const now = new Date();
const year  = now.getFullYear();
const month = now.getMonth() + 1;
// ============================

const domain   = process.env.JIRA_DOMAIN || 'ticket.rsint.net';
const bearerToken = `Bearer ${PAT}`;
const startDate     = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
const endDate       = new Date(Date.UTC(year, month, 0, 0, 0, 0));
const startMillis   = startDate.getTime();
const endMillis     = endDate.getTime();
const jqlStartDate  = startDate.toISOString().substring(0, 10);
const jqlEndDate    = endDate.toISOString().substring(0, 10);

async function fetchIssues() {
  const issues = [];
  let startAt = 0;
  const jql   = `worklogDate >= '${jqlStartDate}' AND worklogDate <= '${jqlEndDate}' AND component = "INV_III"`;

  let totalIssues = 0;

  do {
    const params = new URLSearchParams({
      jql,
      fields: 'key',
      maxResults: '100',
      startAt: startAt.toString(),
    });
    const url = `https://${domain}/rest/api/2/search?${params.toString()}`;
    const resp = await fetch(url, { headers: { 'Authorization': bearerToken, 'Accept': 'application/json' } });

    if (!resp.ok) {
      const text = await resp.text();
      console.error(`Error fetching issues: ${resp.status} - ${text}`);
      throw new Error(`Failed to fetch issues: ${resp.status}`);
    }

    const data = await resp.json();
    data.issues.forEach(issue => issues.push(issue.key));
    startAt += data.issues.length;
    totalIssues = data.total;
  } while (startAt < totalIssues);

  return issues;
}

async function fetchWorklogs(issues) {
  const dailyTotals = {};
  for (const issueKey of issues) {
    let startAt = 0;
    let totalWorklogs = 0;

    do {
      const params = new URLSearchParams({
        startedAfter: startMillis.toString(),
        startedBefore: endMillis.toString(),
        maxResults: '100',
        startAt: startAt.toString(),
      });
      const url = `https://${domain}/rest/api/2/issue/${encodeURIComponent(issueKey)}/worklog?${params.toString()}`;
      const resp = await fetch(url, { headers: { 'Authorization': bearerToken, 'Accept': 'application/json' } });

      if (!resp.ok) {
        const text = await resp.text();
        console.error(`Error fetching worklogs for ${issueKey}: ${resp.status} - ${text}`);
        throw new Error(`Failed to fetch worklogs for ${issueKey}: ${resp.status}`);
      }

      const data = await resp.json();

      (data.worklogs || []).forEach(wl => {
        const name = wl.author.displayName;
        const date = new Date(wl.started).toISOString().substring(0, 10);
        const issueKey = wl.issue ? wl.issue.key : 'Unknown'; // Extract the issue key or set a default

        if (!dailyTotals[name]) {
          dailyTotals[name] = {};
        }
        if (!dailyTotals[name][date]) {
          dailyTotals[name][date] = {};
        }
        dailyTotals[name][date][issueKey] = (dailyTotals[name][date][issueKey] || 0) + wl.timeSpentSeconds;
      });

      startAt += (data.worklogs || []).length;
      totalWorklogs = data.total;
    } while (startAt < totalWorklogs);
  }
  return dailyTotals;
}

async function run() {
  try {
    const issues = await fetchIssues();
    console.log(`Found ${issues.length} issues with worklogs from ${jqlStartDate} to ${jqlEndDate}`);
    const dailyTotals = await fetchWorklogs(issues);

    console.log('Worklogs per user and day:');
    Object.entries(dailyTotals).forEach(([user, dailyData]) => {
      if (userName && !user.toLowerCase().includes(userName.toLowerCase())) {
        return;
      }

      let total = 0;
      console.log(`\nUser: ${user}`);
      Object.entries(dailyData).forEach(([date, issueData]) => {
        total += Object.values(issueData).reduce((acc, secs) => acc + secs, 0) / 3600;
        console.log(`${date}: ${(Object.values(issueData).reduce((acc, secs) => acc + secs, 0) / 3600).toFixed(2)} h (Issues: ${Object.keys(issueData).join(', ')})`);
      });

      console.log(`> Total hours for ${user}: ${total.toFixed(2)} h`);
    });
  } catch (err) {
    console.error('Error fetching worklogs:', err);
  }
}

run();
