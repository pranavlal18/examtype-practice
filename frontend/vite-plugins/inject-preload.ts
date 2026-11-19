import { IndexHtmlTransformContext, Plugin } from "vite";
// eslint-disable-next-line import/no-unresolved
import UnpluginInjectPreload from "unplugin-inject-preload/vite";
import { basename } from "node:path";
export function injectPreload(): Plugin {
  const base = UnpluginInjectPreload({
    files: [
      {
        // standalone.*.css only serves the static legal/404 pages; index.html never links it
        outputMatch: /css\/(?!standalone\.).*\.css$/,
        attributes: {
          as: "style",
          type: "text/css",
          rel: "preload",
          crossorigin: true,
        },
      },
      {
        outputMatch: /.*\.woff2$/,
        attributes: {
          as: "font",
          type: "font/woff2",
          rel: "preload",
          crossorigin: true,
        },
      },
    ],
    injectTo: "head-prepend",
  }) as {
    name: string;
    vite: {
      transformIndexHtml: {
        handler: (html: string, ctx: IndexHtmlTransformContext) => string;
      };
    };
  };

  return {
    name: base.name,
    ...base.vite,
    transformIndexHtml(html, ctx) {
      //only add preload to the index.html file
      if (basename(ctx.filename) !== "index.html") {
        return html;
      }
      return base.vite.transformIndexHtml.handler(html, ctx);
    },
  };
}
