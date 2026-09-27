import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "xyz.stabix",
  appName: "StabiX",

  server: {
    url: process.env.CAPACITOR_SERVER_URL || undefined,
    cleartext: process.env.CAPACITOR_SERVER_URL?.startsWith("http://") || false,
  },
};

export default config;