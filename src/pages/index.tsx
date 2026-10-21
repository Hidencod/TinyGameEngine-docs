import type {CSSProperties, ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function Shot({name, alt, className}: {name: string; alt: string; className?: string}) {
  return <img src={useBaseUrl(`/img/showcase/${name}.webp`)} alt={alt} className={className} width={1280} height={720} loading="lazy" draggable={false} />;
}

const GAMES = [
  {to: '/docs/showcase/street-racer', shot: 'street-racer-race', title: 'Street Racer', text: 'AI opponents, laps, a grid start and a best-time board.'},
  {to: '/docs/showcase/crystal-vault', shot: 'crystal-vault-play', title: 'Crystal Vault', text: 'Guards, pickups, a win screen and a second language.'},
  {to: '/docs/showcase/loot-room', shot: 'loot-room-room', title: 'Loot Room', text: 'An inventory, a book of items and a health bar.'},
];

const SCRIPT = `export let speed = 2;   // set per object in the Inspector
let timer = 0;

function update(dt) {
  timer += dt;
  if (timer > 3) { timer = 0; game.log('3 seconds passed'); }
}

function onCollision(other) {
  game.log('hit something');
}`;

const INSIDE = [
  {title: 'Physics', text: 'Rigid bodies, triggers, ray casts and ray-cast cars.'},
  {title: '2D and 3D', text: 'Tilemaps, sprites and animated tiles next to full 3D scenes.'},
  {title: 'Animation', text: 'Animators, inverse kinematics and a timeline for cutscenes.'},
  {title: 'Interface', text: 'Canvas, layout groups, buttons and fonts, built like Unity’s uGUI.'},
  {title: 'Debugger', text: 'Breakpoints, watches and a console while the game runs.'},
  {title: 'GitHub sync', text: 'The project is a folder of small text files you can push, pull and branch.'},
];

const LEARN = [
  {to: '/docs/getting-started/first-game', title: 'Your first game', text: 'Roll a ball, collect coins, keep score. About 15 minutes.'},
  {to: '/docs/editor/overview', title: 'The editor', text: 'Every panel, tab and menu.'},
  {to: '/docs/logic/event-sheets', title: 'Event sheets', text: 'Conditions, actions and picking.'},
  {to: '/docs/reference/scripting-api', title: 'Scripting API', text: 'Everything a script can call.'},
];

const delay = (n: number): CSSProperties => ({['--i' as string]: n});

export default function Home(): ReactNode {
  return (
    <Layout title="Tiny Game Engine" description="A game engine and editor for 3D and 2D games that runs in your browser and on your phone, with physics, event sheets, TypeScript scripting and export to Android and the web.">
      <div className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroText}>
            <h1 className={styles.title} style={delay(0)}>Make 3D and 2D games in your browser or on your phone</h1>
            <p className={styles.sub} style={delay(1)}>
              A complete engine and editor: physics, event sheets, TypeScript scripting, animation and one-tap export to Android and the web.
            </p>
            <div className={styles.buttons} style={delay(2)}>
              <a className={styles.primary} href="https://editor.jeevagames.com">Open the editor</a>
              <Link className={styles.ghost} to="/docs/getting-started/first-game">Make your first game</Link>
            </div>
          </div>
          <div className={styles.stage} style={delay(3)}>
            <div className={styles.frame}>
              <Shot name="crystal-vault-editor" alt="The editor with the object list on the left, the 3D scene in the middle and the inspector on the right" className={styles.shot} />
            </div>
            <div className={`${styles.frame} ${styles.inset}`}>
              <Shot name="street-racer-race" alt="A race in Street Racer, a game made in the editor" className={styles.shot} />
            </div>
          </div>
        </header>

        <section className={styles.section}>
          <h2 className={styles.h2}>Games made with it</h2>
          <div className={styles.games}>
            {GAMES.map((g) => (
              <Link key={g.to} to={g.to} className={styles.game}>
                <div className={styles.gameImg}><Shot name={g.shot} alt="" className={styles.shot} /></div>
                <h3>{g.title}</h3>
                <p>{g.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.row}>
          <div className={styles.rowText}>
            <h2 className={styles.h2}>Events that read like rules</h2>
            <p>When something happens, do these actions. Pick from ready-made conditions and actions for collisions, taps, timers, sounds, score and menus. Variables, loops and functions are there when a game needs real logic.</p>
            <Link className={styles.link} to="/docs/logic/event-sheets">How event sheets work</Link>
          </div>
          <div className={styles.frame}><Shot name="crystal-vault-events" alt="An event sheet in the editor" className={styles.shot} /></div>
        </section>

        <section className={`${styles.row} ${styles.flip}`}>
          <div className={styles.rowText}>
            <h2 className={styles.h2}>Scripts when you want code</h2>
            <p>Write JavaScript or TypeScript in the editor with completion that knows your objects, sounds and fields. Scripts and events work on the same game and can call each other.</p>
            <Link className={styles.link} to="/docs/logic/scripting">Read about scripting</Link>
          </div>
          <pre className={styles.code}><code>{SCRIPT}</code></pre>
        </section>

        <section className={styles.row}>
          <div className={styles.rowText}>
            <h2 className={styles.h2}>Ship it as an app or a web page</h2>
            <p>Export a signed Android APK or a single HTML file, built on your device with nothing uploaded. Back the project up to GitHub and open it on another device.</p>
            <Link className={styles.link} to="/docs/publish/export-apk">How exporting works</Link>
          </div>
          <ul className={styles.outputs}>
            <li><b>.apk</b><span>Signed Android app</span></li>
            <li><b>.html</b><span>One file, plays anywhere</span></li>
            <li><b>Git</b><span>A folder of small text files</span></li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>What is inside</h2>
          <div className={styles.inside}>
            {INSIDE.map((f) => (
              <div key={f.title} className={styles.cell}>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Learn</h2>
          <div className={styles.learn}>
            {LEARN.map((l) => (
              <Link key={l.to} to={l.to} className={styles.learnRow}>
                <span className={styles.learnTitle}>{l.title}</span>
                <span className={styles.learnText}>{l.text}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.close}>
          <h2 className={styles.h2}>Start with a blank scene</h2>
          <div className={styles.buttons}>
            <a className={styles.primary} href="https://editor.jeevagames.com">Open the editor</a>
            <Link className={styles.ghost} to="/docs/intro">Read the guide</Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
