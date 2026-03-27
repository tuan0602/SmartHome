import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomeDashboard } from "./components/HomeDashboard";
import { DevicesControl } from "./components/DevicesControl";
import { PomodoroTimer } from "./components/PomodoroTimer";
import { Security } from "./components/Security";
import { Notifications } from "./components/Notifications";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomeDashboard },
      { path: "devices", Component: DevicesControl },
      { path: "pomodoro", Component: PomodoroTimer },
      { path: "security", Component: Security },
      { path: "notifications", Component: Notifications },
    ],
  },
]);
