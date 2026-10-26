import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  guide: [
    'intro',
    {
      type: 'category', label: 'Getting started', collapsed: false,
      items: ['getting-started/install', 'getting-started/home-screen', 'getting-started/first-game', 'getting-started/keep-score'],
    },
    {
      type: 'category', label: 'The editor',
      items: [
        'editor/overview', 'editor/viewport', 'editor/objects', 'editor/inspector', 'editor/assets',
        'editor/scene-tab', 'editor/scenes', 'editor/project-settings', 'editor/play-mode', 'editor/debugging', 'editor/shortcuts',
      ],
    },
    {
      type: 'category', label: 'Building your world',
      items: ['world/shapes-and-materials', 'world/shaders', 'world/models', 'world/animator', 'world/timeline', 'world/render-textures', 'world/localization', 'world/services', 'world/purchases', 'world/navmesh', 'world/lighting', 'world/post-processing', 'world/terrain', 'world/water', 'world/curve', 'world/decals', 'world/sprites', 'world/tilemaps', 'world/2d-games', 'world/cameras-and-lights', 'world/physics', 'world/sound', 'world/particles', 'world/ui'],
    },
    'behaviors',
    {
      type: 'category', label: 'Game logic',
      items: ['logic/event-sheets', 'logic/event-editor', 'logic/variables', 'logic/data-tables', 'logic/advanced-events', 'logic/scripting'],
    },
    {
      type: 'category', label: 'Share your game',
      items: ['publish/publish-link', 'publish/export-html', 'publish/export-apk', 'publish/backup', 'publish/github-sync'],
    },
    'templates',
    {
      type: 'category', label: 'Showcase',
      items: ['showcase/street-racer', 'showcase/loot-room', 'showcase/crystal-vault'],
    },
    {
      type: 'category', label: 'Help',
      items: ['help/performance', 'help/troubleshooting', 'help/faq', 'help/feedback'],
    },
  ],
  reference: [
    'reference/index',
    'reference/components',
    'reference/behaviors',
    'reference/conditions',
    'reference/actions',
    'reference/expressions',
    'reference/scripting-api',
  ],
};

export default sidebars;
