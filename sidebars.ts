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
        'editor/overview', 'editor/windows', 'editor/viewport', 'editor/objects', 'editor/inspector', 'editor/assets',
        'editor/scene-tab', 'editor/scenes', 'editor/project-settings', 'editor/play-mode', 'editor/debugging', 'editor/profiler', 'editor/tests', 'editor/claude-link', 'editor/shortcuts',
      ],
    },
    {
      type: 'category', label: 'Building your world',
      items: ['world/shapes-and-materials', 'world/editable-mesh', 'world/shaders', 'world/models', 'world/animator', 'world/timeline', 'world/render-textures', 'world/video-player', 'world/layers', 'world/localization', 'world/services', 'world/purchases', 'world/web-requests', 'world/multiplayer', 'world/navmesh', 'world/lighting', 'world/baked-lighting', 'world/occlusion-culling', 'world/post-processing', 'world/terrain', 'world/water', 'world/curve', 'world/decals', 'world/sprites', 'world/tilemaps', 'world/sprite-shape', 'world/sprite-mask', 'world/2d-games', 'world/2d-lights', 'world/pixel-perfect-camera', 'world/2d-animation', 'world/2d-effectors', 'world/cameras-and-lights', 'world/virtual-cameras', 'world/physics', 'world/character-controller', 'world/sound', 'world/particles', 'world/cloth', 'world/ui'],
    },
    'behaviors',
    {
      type: 'category', label: 'Game logic',
      items: ['logic/event-sheets', 'logic/event-editor', 'logic/variables', 'logic/data-tables', 'logic/advanced-events', 'logic/scripting', 'logic/editor-scripts'],
    },
    {
      type: 'category', label: 'Share your game',
      items: ['publish/publish-link', 'publish/build', 'publish/steam-upload', 'publish/steam-deck', 'publish/export-html', 'publish/export-apk', 'publish/backup', 'publish/github-sync'],
    },
    'templates',
    {
      type: 'category', label: 'Showcase',
      items: ['showcase/street-racer', 'showcase/loot-room', 'showcase/crystal-vault', 'showcase/hungry-hole', 'showcase/ball-arena', 'showcase/firefly-grove', 'showcase/sun-temple', 'showcase/valley-post', 'showcase/lost-keys', 'showcase/ember-crypt', 'showcase/sprocket-hills'],
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
