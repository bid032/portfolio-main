import { buildLegacyTheme } from "sanity";

export const myTheme = buildLegacyTheme({
  /* Brand colors */
  "--black": "#0a0a0a",
  "--white": "#ffffff",
  "--gray": "#94a3b8",
  "--gray-base": "#121214",

  "--brand-primary": "#f57f00",

  /* Default button */
  "--default-button-color": "#1b1b1e",
  "--default-button-primary-color": "#f57f00",
  "--default-button-success-color": "#22c55e",
  "--default-button-danger-color": "#ef4444",

  /* State colors */
  "--state-info-color": "#3b82f6",
  "--state-success-color": "#22c55e",
  "--state-warning-color": "#f59e0b",
  "--state-danger-color": "#ef4444",

  /* Navbar */
  "--main-navigation-color": "#0a0a0a",
  "--main-navigation-color--inverted": "#ffffff",

  /* Focus ring */
  "--focus-color": "#f57f00",
});
