import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Config {
  jiraHost: string;
  apiToken: string;
  corsProxy: string;
}

interface ConfigState {
  config: Config;
  setConfig: (newConfig: Config) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      config: {
        jiraHost: "",
        apiToken: "",
        corsProxy: "",
      },
      setConfig: (newConfig) => set({ config: newConfig }),
    }),
    {
      name: "jira-timesheet-config",
    }
  )
);
