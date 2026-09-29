import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const STEPS = [
  {icon: '🧊', title: 'Place objects', text: 'Shapes, free 3D models, lights, a camera.'},
  {icon: '🏃', title: 'Add behaviors', text: 'Walk, jump, drive, follow — in one tap.'},
  {icon: '🧩', title: 'Write events', text: 'WHEN something happens → DO actions.'},
  {icon: '▶', title: 'Play & share', text: 'Test instantly, export an APK or HTML file.'},
];

const FEATURES = [
  {icon: '📱', title: 'Made for your phone', text: 'Build, test and export a 3D game with touch. No PC needed.'},
  {icon: '🧩', title: 'No-code event sheets', text: '139 ready-made conditions and actions, with variables, functions and loops.'},
  {icon: '🧱', title: 'Real physics', text: 'Gravity, collisions, triggers, bouncing and ray-cast cars.'},
  {icon: '🖼️', title: 'Menus & HUD', text: 'Buttons, labels, health bars and full-screen menus.'},
  {icon: '🌐', title: 'Free assets', text: 'Hundreds of CC0 models, sounds and 360° skies by Kenney.'},
  {icon: '🤖', title: 'Export APK & HTML', text: 'Signed Android apps and single-file web games, built offline.'},
];

const START = [
  {to: '/docs/getting-started/first-game', icon: '🎓', title: 'Make your first game', text: 'A 15-minute tutorial: roll a ball, collect coins, keep score and win.'},
  {to: '/docs/editor/overview', icon: '🗺️', title: 'Learn the editor', text: 'Every screen, tab, button and menu explained.'},
  {to: '/docs/logic/event-sheets', icon: '⚡', title: 'Make things happen', text: 'How events, conditions, actions and picking work.'},
  {to: '/docs/reference', icon: '📚', title: 'Look something up', text: 'Components, behaviors, conditions, actions and the scripting API.'},
];

export default function Home(): ReactNode {
  return (
    <Layout title="Make 3D games on your phone" description="Documentation for Tiny Game Engine, the mobile-first 3D game engine and editor.">
      <header className={styles.hero}>
        <img src={useBaseUrl('/img/logo.png')} alt="" className={styles.logo} />
        <h1 className={styles.title}>Tiny Game Engine</h1>
        <p className={styles.tagline}>Make 3D games on your phone.</p>
        <p className={styles.sub}>No PC. No code required. This is the complete guide — from your first game to every setting in the editor.</p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/getting-started/first-game">Make your first game</Link>
          <Link className="button button--secondary button--lg" to="/docs/intro">Read the guide</Link>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.steps} aria-label="How a game is made">
          {STEPS.map((s, i) => (
            <div key={s.title} className={styles.step}>
              <div className={styles.stepNum}>{i + 1}</div>
              <div className={styles.stepIcon}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h2>Start here</h2>
          <div className={styles.start}>
            {START.map((c) => (
              <Link key={c.to} className={styles.startCard} to={c.to}>
                <span className={styles.startIcon}>{c.icon}</span>
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
                <span className={styles.featureIcon}>{f.icon}</span>
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
