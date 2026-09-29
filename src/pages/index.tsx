import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const FEATURES = [
  {icon: '📱', title: 'Made for your phone', text: 'Build, test and export a 3D game with touch. No PC needed.'},
  {icon: '🧩', title: 'No-code event sheets', text: 'WHEN something happens → DO actions. 139 ready-made conditions and actions.'},
  {icon: '🏃', title: 'Behaviors', text: 'Platformer, car, top-down, camera follow… add movement in one tap.'},
  {icon: '🧱', title: 'Real physics', text: 'Rapier physics: gravity, collisions, bouncing, ray-cast cars.'},
  {icon: '🌐', title: 'Free models & sounds', text: 'Hundreds of Kenney CC0 models, sounds and skies, one tap away.'},
  {icon: '🤖', title: 'Export APK & HTML', text: 'Signed Android apps and single-file web games, built on the phone.'},
];

export default function Home(): ReactNode {
  return (
    <Layout title="Make 3D games on your phone" description="Documentation for Tiny Game Engine, the mobile-first 3D game engine and editor.">
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <img src={useBaseUrl('/img/logo.png')} alt="" className={styles.logo} />
          <h1>Tiny Game Engine</h1>
          <p className={styles.tagline}>Make 3D games on your phone — no PC, no code required.</p>
          <p className={styles.sub}>Everything the editor can do, explained step by step with real screenshots.</p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs/getting-started/first-game">Make your first game</Link>
            <Link className="button button--secondary button--lg" to="/docs/intro">Read the guide</Link>
          </div>
        </div>
        <div className={styles.heroShots}>
          <img src={useBaseUrl('/img/shots/editor-overview.webp')} alt="The editor" />
          <img src={useBaseUrl('/img/hero-play-kart.webp')} alt="Kart racing game" />
        </div>
      </header>
      <main className={styles.main}>
        <section className={styles.features}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.feature}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </section>
        <section className={styles.paths}>
          <h2>Where to start</h2>
          <div className="tge-cards">
            <Link className="tge-card" to="/docs/getting-started/first-game"><div className="tge-card-icon">🎓</div><div className="tge-card-title">Tutorial</div><div className="tge-card-text">Roll a ball, collect coins, keep score and win — in 15 minutes.</div></Link>
            <Link className="tge-card" to="/docs/editor/overview"><div className="tge-card-icon">🗺️</div><div className="tge-card-title">Editor tour</div><div className="tge-card-text">Every button, tab and menu of the editor.</div></Link>
            <Link className="tge-card" to="/docs/logic/event-sheets"><div className="tge-card-icon">🧩</div><div className="tge-card-title">Event sheets</div><div className="tge-card-text">Make things happen without writing code.</div></Link>
            <Link className="tge-card" to="/docs/reference"><div className="tge-card-icon">📚</div><div className="tge-card-title">Reference</div><div className="tge-card-text">Every component, behavior, condition, action and script function.</div></Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
