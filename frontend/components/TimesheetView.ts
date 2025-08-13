import { LitElement, html, css } from 'lit';
import type { JiraWorklog } from '../../types/JiraWorklog';

export class TimesheetView extends LitElement {
  static styles = css`
    p, h1, h2, h3 {
      font-family: sans-serif;
    }
    .day {
      margin-bottom: 1em;
      padding: 0.5em;
      border: 1px solid #ccc;
      border-radius: 6px;
    }
    .worklog {
      margin-left: 1em;
    }
    .total {
      font-weight: bold;
      margin-top: 0.5em;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  `;

  data: JiraWorklog[] = [];
  jiraDomain: string = '';
  selectedUser: string = '';
  users: string[] = [];

  private truncate(text: string, length = 20): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '…' : text;
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadData();
  }

  async loadData() {
    const res = await fetch('/api/timesheet');
    const { jiraDomain, worklogs } = await res.json();
    this.jiraDomain = jiraDomain;

    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user');
    if (user) {
      this.selectedUser = user;
    }

    this.data = worklogs;

    // Extract unique users
    this.users = Object.keys(worklogs.reduce((acc: Record<string, boolean>, wl: JiraWorklog) => {
      acc[wl.author.displayName] = true;
      return acc;
    }, {}));

    this.requestUpdate();
  }

  handleUserChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.selectedUser = value;

    // Update query parameter
    const url = new URL(window.location.href);
    url.searchParams.set('user', value);
    window.history.pushState({}, '', url.toString());

    this.requestUpdate();
  }

  render() {
    if (!this.data?.length) {
      return html`<p>Loading...</p>`;
    }

    // Group worklogs by user → date
    const grouped: Record<string, Record<string, JiraWorklog[]>> = {};

    for (const wl of this.data) {
      const user = wl.author.displayName;
      const date = new Date(wl.started).toISOString().substring(0, 10);

      if (!grouped[user]) grouped[user] = {};
      if (!grouped[user][date]) grouped[user][date] = [];
      grouped[user][date].push(wl);
    }

    return html`
      <input type="text" .value=${this.selectedUser} @input=${this.handleUserChange} .placeholder="Enter user name" />
      <h1>Timesheet</h1>
      ${Object.entries(grouped).filter(([user, days]) => this.selectedUser === '' || user === this.selectedUser).map(([user, days]) => {
      let userTotalSeconds = 0;

      const dayTemplates = Object.entries(days).map(([day, worklogs]) => {
        const dayTotalSeconds = worklogs.reduce(
          (sum, wl) => sum + wl.timeSpentSeconds,
          0
        );
        userTotalSeconds += dayTotalSeconds;

        return html`
            <div class="day">
              <h3>${day}</h3>
              ${worklogs.map(wl => html`
                <div class="worklog">
                  <a href="https://${this.jiraDomain}/browse/${wl.issueKey ?? wl.issueId}" target="_blank">
                    ${wl.issueKey ?? wl.issueId}
                  </a>
                  - ${this.truncate(wl.comment || '(No comment)')}
                  - ${(wl.timeSpentSeconds / 3600).toFixed(2)} h
                </div>
              `)}
              <div class="total">Day total: ${(dayTotalSeconds / 3600).toFixed(2)} h</div>
            </div>
          `;
      });

      return html`
          <div>
            <h2>${user}</h2>
            ${dayTemplates}
            <div class="total">Monthly total: ${(userTotalSeconds / 3600).toFixed(2)} h</div>
          </div>
        `;
    })}
    `;
  }
}

customElements.define('timesheet-view', TimesheetView);
