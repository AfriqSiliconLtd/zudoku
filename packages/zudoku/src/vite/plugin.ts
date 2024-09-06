import react from "@vitejs/plugin-react";
import { type PluginOption } from "vite";
import { type ZudokuPluginOptions } from "../config/config.js";
import { type LoadedConfig } from "./config.js";
import viteApiKeysPlugin from "./plugin-api-keys.js";
import viteApiPlugin from "./plugin-api.js";
import viteAuthPlugin from "./plugin-auth.js";
import viteAliasPlugin from "./plugin-component.js";
import { createConfigReloadPlugin } from "./plugin-config-reload.js";
import viteConfigPlugin from "./plugin-config.js";
import viteCustomCss from "./plugin-custom-css.js";
import viteDocsPlugin from "./plugin-docs.js";
import { viteHtmlTransform } from "./plugin-html-transform.js";
import { viteIconsPlugin } from "./plugin-icons.js";
import viteMdxPlugin from "./plugin-mdx.js";
import viteRedirectPlugin from "./plugin-redirect.js";
import { viteSidebarPlugin } from "./plugin-sidebar.js";

export default function vitePlugin(
  initialConfig: ZudokuPluginOptions,
  onConfigChange?: () => Promise<LoadedConfig>,
): PluginOption {
  const [configReloadPlugin, getCurrentConfig] = createConfigReloadPlugin(
    initialConfig,
    onConfigChange,
  );

  return [
    viteMdxPlugin(getCurrentConfig),
    react({ include: /\.(mdx?|jsx?|tsx?)$/ }),
    viteConfigPlugin(initialConfig),
    viteApiKeysPlugin(getCurrentConfig),
    viteAuthPlugin(getCurrentConfig),
    viteDocsPlugin(getCurrentConfig),
    viteIconsPlugin(),
    viteSidebarPlugin(getCurrentConfig),
    viteApiPlugin(getCurrentConfig),
    viteAliasPlugin(getCurrentConfig),
    viteRedirectPlugin(getCurrentConfig),
    viteCustomCss(getCurrentConfig),
    viteHtmlTransform(),
    configReloadPlugin,
  ];
}
