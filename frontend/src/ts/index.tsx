// Import sorting is disabled for this file (.oxfmtrc.json): many imports run
// side effects on load, so their order matters.

import "./event-handlers/global";

import "./console-globals";
import "./test/tts";
import { render } from "solid-js/web";
import { App } from "./components/core/App";
import { boot } from "./boot";

import "./input/hotkeys";

// Lock Math.random
Object.defineProperty(Math, "random", {
  value: Math.random,
  writable: false,
  configurable: false,
  enumerable: true,
});

// Freeze Math object
Object.freeze(Math);

// Lock Math on window
Object.defineProperty(window, "Math", {
  value: Math,
  writable: false,
  configurable: false,
  enumerable: true,
});

// render before anything that might touch component-rendered DOM (eg. test page).
// Renders after the static markup in <body> (index.html)
render(() => <App />, document.body);
void boot();
