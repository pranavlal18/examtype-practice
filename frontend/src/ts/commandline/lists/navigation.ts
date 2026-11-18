import { navigate } from "../../router/navigate";
import { toggleFullscreen } from "../../utils/misc";
import { Command } from "../types";

const commands: Command[] = [
  {
    id: "viewTypingPage",
    display: "View Typing Page",
    alias: "navigate go to start begin type test",
    fa: { icon: "fa-keyboard" },
    exec: (): void => {
      void navigate({ to: "/" });
    },
  },
  {
    id: "viewExam",
    display: "View Government Exam Simulator",
    alias: "navigate exam dest ssc government test",
    fa: { icon: "fa-graduation-cap" },
    exec: (): void => {
      void navigate({ to: "/exam" });
    },
  },
  {
    id: "viewTrainer",
    display: "View Weak-Key Trainer",
    alias: "navigate trainer weak keys drill",
    fa: { icon: "fa-dumbbell" },
    exec: (): void => {
      void navigate({ to: "/trainer" });
    },
  },
  {
    id: "viewSettings",
    display: "View Settings Page",
    alias: "navigate go to",
    fa: { icon: "fa-cog" },
    exec: (): void => {
      void navigate({ to: "/settings" });
    },
  },
  {
    id: "toggleFullscreen",
    display: "Toggle Fullscreen",
    fa: { icon: "fa-expand" },
    exec: (): void => {
      toggleFullscreen();
    },
  },
];

export default commands;
