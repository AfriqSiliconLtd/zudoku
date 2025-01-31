import { type RouteObject } from "react-router-dom";
import { configuredApiKeysPlugin } from "virtual:zudoku-api-keys-plugin";
import { configuredApiPlugins } from "virtual:zudoku-api-plugins";
import { configuredAuthProvider } from "virtual:zudoku-auth";
import { configuredCustomPagesPlugin } from "virtual:zudoku-custom-pages-plugin";
import { configuredDocsPlugins } from "virtual:zudoku-docs-plugins";
import { configuredRedirectPlugin } from "virtual:zudoku-redirect-plugin";
import { configuredSearchPlugin } from "virtual:zudoku-search-plugin";
import { configuredSidebar } from "virtual:zudoku-sidebar";
import "virtual:zudoku-theme.css";
import { Layout, RouterError, Zudoku } from "zudoku/components";
import type { ZudokuConfig } from "../config/config.js";
import type { ZudokuContextOptions } from "../lib/core/ZudokuContext.js";
import { isNavigationPlugin } from "../lib/core/plugins.js";

export const convertZudokuConfigToOptions = (
  config: ZudokuConfig,
): ZudokuContextOptions => {
  const fallbackLogoLight =
    config.page?.logoUrl ??
    "https://cdn.zudoku.dev/logos/zudoku-logo-full-light.svg";
  const fallbackLogoDark =
    config.page?.logoUrl ??
    "https://cdn.zudoku.dev/logos/zudoku-logo-full-dark.svg";

  const isUsingFallback =
    !config.page?.logoUrl &&
    !config.page?.logo?.src?.light &&
    !config.page?.logo?.src?.dark;

  return {
    page: {
      ...config.page,
      logo: {
        ...(isUsingFallback ? { width: "130px" } : {}),
        ...config.page?.logo,
        src: {
          light: config.page?.logo?.src?.light ?? fallbackLogoLight,
          dark: config.page?.logo?.src?.dark ?? fallbackLogoDark,
        },
      },
    },
    slotlets: config.UNSAFE_slotlets,
    metadata: {
      favicon: "https://cdn.zudoku.dev/logos/favicon.svg",
      title: "%s - Zudoku",
      ...config.metadata,
    },
    sidebars: configuredSidebar,
    topNavigation: config.topNavigation,
    mdx: config.mdx,
    authentication: configuredAuthProvider,
    plugins: [
      ...configuredDocsPlugins,
      ...configuredApiPlugins,
      ...(configuredSearchPlugin ? [configuredSearchPlugin] : []),
      ...(configuredRedirectPlugin ? [configuredRedirectPlugin] : []),
      ...(configuredApiKeysPlugin ? [configuredApiKeysPlugin] : []),
      ...(configuredCustomPagesPlugin ? [configuredCustomPagesPlugin] : []),
      ...(configuredAuthProvider?.getAuthenticationPlugin
        ? [configuredAuthProvider.getAuthenticationPlugin()]
        : []),
      ...(config.plugins ?? []),
    ],
  };
};

export const getRoutesByOptions = (options: ZudokuContextOptions) => {
  const allPlugins = [
    ...(options.plugins ? options.plugins : []),
    ...(options.authentication?.getAuthenticationPlugin
      ? [options.authentication.getAuthenticationPlugin()]
      : []),
  ];

  const routes = allPlugins
    .flatMap((plugin) => (isNavigationPlugin(plugin) ? plugin.getRoutes() : []))
    .concat({
      path: "*",
      loader: () => {
        throw new Response("Not Found", { status: 404 });
      },
    });

  return routes;
};

export const getRoutesByConfig = (config: ZudokuConfig): RouteObject[] => {
  const options = convertZudokuConfigToOptions(config);
  const routes = getRoutesByOptions(options);

  return [
    {
      element: (
        <Zudoku {...options}>
          <Layout />
        </Zudoku>
      ),
      children: [
        {
          errorElement: <RouterError />,
          children: routes,
        },
      ],
    },
  ];
};
