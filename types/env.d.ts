declare namespace NodeJS {
  interface ProcessEnv {
    JIRA_DOMAIN: string;
    JIRA_PAT: string;
    API_URL?: string;
    FRONTEND_PORT?: string;
    TEAM_DEVELOPERS?: string; // comma-separated display names
  }
}

// CSS Modules type declarations
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}
