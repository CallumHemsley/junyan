import base from "../../playwright.config";

export default {
  ...base,
  testDir: ".",
  testMatch: "*.probe.ts",
  projects: base.projects!.filter((project) => project.name === "desktop"),
  webServer: (base.webServer as object[]).slice(1).map((server) => ({ ...server, cwd: new URL("../..", import.meta.url).pathname })),
  reporter: "list",
};
