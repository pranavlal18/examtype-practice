import { Link } from "@solidjs/meta";
import { createMemo, JSXElement } from "solid-js";

import { Theme } from "../../constants/themes";

export function FavIcon(props: { theme: Theme }): JSXElement {
  const icon = createMemo<string>(() => {
    void props.theme;
    const svgPre = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="14" fill="#172554"/>
      <path d="M36 10 L21 36 H31 L27 54 L47 27 H36 L44 10 Z" fill="#fbbf24"/>
      <path d="M8 22 H24 M8 32 H20 M8 42 H24" stroke="#f97316" stroke-width="4" stroke-linecap="round"/>
    </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svgPre)}`;
  });

  return (
    <Link id="favicon" rel="shortcut icon" type="image/svg+xml" href={icon()} />
  );
}
