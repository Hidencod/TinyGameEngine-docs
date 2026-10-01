import React, {useState, type ReactNode} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './PlayEmbed.module.css';

/**
 * A playable exported game inside a page. Shows a poster first and loads the game
 * (a single HTML file, often 10+ MB) only when the reader clicks Play.
 */
export function PlayEmbed({src, poster, title, size}: {src: string; poster: string; title: string; size?: string}): ReactNode {
  const [on, setOn] = useState(false);
  const img = useBaseUrl(poster);
  return (
    <figure className={styles.wrap}>
      <div className={styles.frame}>
        {on ? (
          <iframe src={src} title={title} allow="fullscreen; autoplay; gamepad" allowFullScreen className={styles.game} />
        ) : (
          <button type="button" className={styles.poster} style={{backgroundImage: `url(${img})`}} onClick={() => setOn(true)}>
            <span className={styles.play}>▶ Play {title}</span>
            {size && <span className={styles.size}>{size} download</span>}
          </button>
        )}
      </div>
      <figcaption className={styles.caption}>
        Plays right here in your browser. <a href={src} target="_blank" rel="noopener noreferrer">Open full screen ↗</a>
      </figcaption>
    </figure>
  );
}
