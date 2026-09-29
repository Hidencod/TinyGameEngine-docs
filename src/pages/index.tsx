import type {CSSProperties, ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import styles from './index.module.css';

/** A sprite from static/img/art (cut from the art sheet by tools/art/cut-sprites.py). */
function Art({name, className, style, alt = ''}: {name: string; className?: string; style?: CSSProperties; alt?: string}) {
  return <img src={useBaseUrl(`/img/art/${name}.webp`)} alt={alt} className={className} style={style} draggable={false} />;
}

const STEPS = [
  {art: 'cube-grass', title: 'Place objects', text: 'Shapes, free 3D models, lights, a camera.'},
  {art: 'penguin', title: 'Add behaviors', text: 'Walk, jump, drive, follow — in one tap.'},
  {art: 'tile-code', title: 'Write events', text: 'WHEN something happens → DO actions.'},
  {art: 'tile-play', title: 'Play & share', text: 'Test instantly, export an APK or HTML file.'},
];

const START = [
  {to: '/docs/getting-started/first-game', art: 'coin', title: 'Make your first game', text: 'A 15-minute tutorial: roll a ball, collect coins, keep score and win.'},
  {to: '/docs/editor/overview', art: 'tile-gear', title: 'Learn the editor', text: 'Every screen, tab, button and menu explained.'},
  {to: '/docs/logic/event-sheets', art: 'tile-gamepad', title: 'Make things happen', text: 'How events, conditions, actions and picking work.'},
  {to: '/docs/reference', art: 'flag', title: 'Look something up', text: 'Components, behaviors, conditions, actions and the scripting API.'},
];

const FEATURES = [
  {art: 'tile-gamepad', title: 'Made for your phone', text: 'Build, test and export a 3D game with touch. No PC needed.'},
  {art: 'cube-stone', title: 'Real physics', text: 'Gravity, collisions, triggers, bouncing and ray-cast cars.'},
  {art: 'tree', title: 'Free assets', text: 'Hundreds of CC0 models, sounds and 360° skies by Kenney.'},
  {art: 'star', title: 'Menus & HUD', text: 'Buttons, labels, health bars and full-screen menus.'},
  {art: 'waterfall', title: 'Particles & sky', text: 'Fire, smoke, confetti, fog and 360° skies.'},
  {art: 'flag-small', title: 'Export APK & HTML', text: 'Signed Android apps and single-file web games, built offline.'},
];

export default function Home(): ReactNode {
  return (
    <Layout title="Make 3D games on your phone" description="Documentation for Tiny Game Engine, the mobile-first 3D game engine and editor.">
      <header className={styles.hero}>
        <div className={styles.sky} aria-hidden>
          <span className={styles.cloud} style={{left: '4%', top: '18%'}} />
          <span className={styles.cloud} style={{left: '46%', top: '6%', transform: 'scale(1.4)'}} />
          <span className={styles.cloud} style={{right: '3%', top: '62%', transform: 'scale(1.2)'}} />
          <Art name="cube-water" className={`${styles.bgCube} ${styles.float3}`} style={{left: '2%', bottom: '8%', width: 90}} />
          <Art name="cube-grass" className={`${styles.bgCube} ${styles.float2}`} style={{left: '38%', bottom: '-2%', width: 80}} />
          <Art name="cube-stone" className={`${styles.bgCube} ${styles.float1}`} style={{right: '4%', top: '8%', width: 70}} />
        </div>

        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <img src={useBaseUrl('/img/logo.png')} alt="" className={styles.logo} />
            <h1 className={styles.title}>Tiny Game Engine</h1>
            <p className={styles.tagline}>Make 3D games on your phone.</p>
            <p className={styles.sub}>No PC. No code required. The complete guide — from your first game to every setting in the editor.</p>
            <div className={styles.buttons}>
              <Link className={`button button--lg ${styles.btnMain}`} to="/docs/getting-started/first-game">Make your first game</Link>
              <Link className={`button button--lg ${styles.btnGhost}`} to="/docs/intro">Read the guide</Link>
            </div>
          </div>

          <div className={styles.stage} role="img" aria-label="A little robot with a game controller floats above a 3D island, next to the editor's scene list and event blocks">
            <Art name="panel-scene" className={`${styles.panelScene} ${styles.float2}`} />
            <Art name="panel-events" className={`${styles.panelEvents} ${styles.float3}`} />
            <Art name="island" className={styles.island} />
            <Art name="robot" className={`${styles.robot} ${styles.float1}`} />
            <Art name="star-small" className={`${styles.star} ${styles.float3}`} />
            <Art name="icon-bar" className={`${styles.iconBar} ${styles.float1}`} />
            <Art name="penguin" className={`${styles.penguin} ${styles.float3}`} />
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.steps} aria-label="How a game is made">
          {STEPS.map((s, i) => (
            <div key={s.title} className={styles.step}>
              <span className={styles.stepNum}>{i + 1}</span>
              <Art name={s.art} className={styles.stepArt} />
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </section>

        <section className={styles.events}>
          <div className={styles.eventsText}>
            <h2>Game rules, snapped together</h2>
            <p>
              Events read like sentences: <b>WHEN</b> something happens, <b>DO</b> these actions.
              Pick from 139 ready-made conditions and actions — collisions, taps, timers, sounds, score, menus —
              and fill in the blanks. No code, but real game logic: variables, loops, functions and more.
            </p>
            <Link className="button button--primary" to="/docs/logic/event-sheets">How events work →</Link>
          </div>
          <div className={styles.blocks} aria-hidden>
            <Art name="block-when" className={styles.block} style={{marginLeft: 0}} />
            <Art name="block-collide" className={styles.block} style={{marginLeft: '8%'}} />
            <Art name="block-sound" className={styles.block} style={{marginLeft: '16%'}} />
            <Art name="block-add" className={styles.block} style={{marginLeft: '8%'}} />
            <Art name="coin-small" className={`${styles.blocksCoin} ${styles.float2}`} />
            <Art name="star-small" className={`${styles.blocksStar} ${styles.float3}`} />
          </div>
        </section>

        <section className={styles.section}>
          <h2>Start here</h2>
          <div className={styles.start}>
            {START.map((c) => (
              <Link key={c.to} className={styles.startCard} to={c.to}>
                <Art name={c.art} className={styles.startArt} />
                <span>
                  <span className={styles.startTitle}>{c.title} →</span>
                  <span className={styles.startText}>{c.text}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>What’s inside</h2>
          <div className={styles.features}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.feature}>
                <Art name={f.art} className={styles.featureArt} />
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.cta}>
          <Art name="robot" className={styles.ctaRobot} />
          <div>
            <h2>Ready? Your first game takes 15 minutes.</h2>
            <p>Roll a ball, collect coins, keep score and win — step by step, with a screenshot for every tap.</p>
            <Link className="button button--primary button--lg" to="/docs/getting-started/first-game">Start the tutorial</Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
