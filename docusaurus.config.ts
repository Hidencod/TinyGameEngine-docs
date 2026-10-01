import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Tiny Game Engine',
  tagline: 'Make 3D games on your phone or in your browser',
  favicon: 'img/favicon.png',

  future: {
    v4: true,
  },

  url: 'https://tinygameengine.jeevagames.com',
  baseUrl: '/',

  organizationName: 'Hidencod',
  projectName: 'TinyGameEngine-docs',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {onBrokenMarkdownLinks: 'throw'},
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {changefreq: 'weekly', priority: 0.5},
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 10,
      },
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {hideable: true, autoCollapseCategories: true},
    },
    navbar: {
      title: 'Tiny Game Engine',
      logo: {alt: 'Tiny Game Engine', src: 'img/logo.png'},
      items: [
        {type: 'docSidebar', sidebarId: 'guide', position: 'left', label: 'Guide'},
        {type: 'docSidebar', sidebarId: 'reference', position: 'left', label: 'Reference'},
        {to: '/docs/templates', label: 'Templates', position: 'left'},
        {to: '/docs/help/faq', label: 'Help', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            {label: 'Getting started', to: '/docs/getting-started/install'},
            {label: 'Your first game', to: '/docs/getting-started/first-game'},
            {label: 'Event sheets', to: '/docs/logic/event-sheets'},
          ],
        },
        {
          title: 'Reference',
          items: [
            {label: 'Conditions', to: '/docs/reference/conditions'},
            {label: 'Actions', to: '/docs/reference/actions'},
            {label: 'Scripting API', to: '/docs/reference/scripting-api'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'Privacy policy', href: 'https://hidencod.github.io/tge-assets/privacy/'},
            {label: 'Contact', href: 'mailto:contact@jeevagames.com'},
            {label: 'Free assets by Kenney', href: 'https://kenney.nl'},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Jeeva Games · Tiny Game Engine`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    tableOfContents: {minHeadingLevel: 2, maxHeadingLevel: 3},
  } satisfies Preset.ThemeConfig,
};

export default config;
