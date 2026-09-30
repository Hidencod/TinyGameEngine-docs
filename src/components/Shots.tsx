import React, {useState, type ReactNode} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

function useShot(name: string): string {
  return useBaseUrl(name.includes('/') ? name : `/img/shots/${name}.webp`);
}

function Zoomable({src, alt}: {src: string; alt: string}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <img src={src} alt={alt} loading="lazy" onClick={() => setOpen(true)} />
      {open && (
        <div className="tge-zoom" onClick={() => setOpen(false)} role="dialog" aria-label={alt}>
          <img src={src} alt={alt} />
        </div>
      )}
    </>
  );
}

/** A full phone screenshot in a phone frame. */
export function Phone({name, caption, alt, size}: {name: string; caption?: ReactNode; alt?: string; size?: 'small' | 'large'}) {
  const src = useShot(name);
  const text = alt ?? (typeof caption === 'string' ? caption : name.replace(/-/g, ' '));
  return (
    <figure className={`tge-phone ${size ?? ''}`}>
      <div className="tge-phone-frame"><Zoomable src={src} alt={text} /></div>
      {caption && <figcaption className="tge-caption">{caption}</figcaption>}
    </figure>
  );
}

/** A cropped screenshot (one card, a toolbar…). `width` in CSS px. */
export function Crop({name, caption, alt, width = 360}: {name: string; caption?: ReactNode; alt?: string; width?: number}) {
  const src = useShot(name);
  const text = alt ?? (typeof caption === 'string' ? caption : name.replace(/-/g, ' '));
  return (
    <figure className="tge-crop" style={{maxWidth: width}}>
      <Zoomable src={src} alt={text} />
      {caption && <figcaption className="tge-caption">{caption}</figcaption>}
    </figure>
  );
}

/** Screenshots side by side. */
export function Row({children}: {children: ReactNode}) {
  return <div className="tge-row">{children}</div>;
}

/** Text with a screenshot on the right (stacks on phones). */
export function Side({children, shot, caption, crop}: {children: ReactNode; shot: string; caption?: ReactNode; crop?: boolean}) {
  return (
    <div className="tge-side">
      <div>{children}</div>
      {crop ? <Crop name={shot} caption={caption} width={260} /> : <Phone name={shot} caption={caption} />}
    </div>
  );
}

/** A numbered step card. */
export function Step({n, title, children}: {n: number | string; title: ReactNode; children: ReactNode}) {
  return (
    <div className="tge-step">
      <div className="tge-step-head"><span className="tge-step-num">{n}</span><span className="tge-step-title">{title}</span></div>
      {children}
    </div>
  );
}

/** Legend for the numbered red badges on a screenshot: <Legend items={['Back', 'Name']} /> */
export function Legend({items}: {items: ReactNode[]}) {
  return (
    <ul className="tge-legend">
      {items.map((it, i) => (
        <li key={i}><span className="tge-badge">{i + 1}</span><span>{it}</span></li>
      ))}
    </ul>
  );
}

/** Link cards grid. */
export function Cards({children}: {children: ReactNode}) {
  return <div className="tge-cards">{children}</div>;
}
export function Card({to, icon, art, title, children, img}: {to: string; icon?: string; art?: string; title: string; children?: ReactNode; img?: string}) {
  const href = useBaseUrl(to);
  const image = useBaseUrl(img ?? '');
  const sprite = useBaseUrl(`/img/art/${art ?? 'coin'}.webp`);
  return (
    <a className="tge-card" href={href}>
      {img && <img src={image} alt="" loading="lazy" />}
      {art ? <img className="tge-card-art" src={sprite} alt="" loading="lazy" /> : icon && <div className="tge-card-icon">{icon}</div>}
      <div className="tge-card-title">{title}</div>
      {children && <div className="tge-card-text">{children}</div>}
    </a>
  );
}

/**
 * A decorative sprite from static/img/art (see tools/art/cut-sprites.py).
 * Placed right after a page's # heading it floats beside the title.
 */
export function Art({name, size = 110, side = 'right'}: {name: string; size?: number; side?: 'right' | 'left' | 'center'}) {
  const src = useBaseUrl(`/img/art/${name}.webp`);
  return <img className={`tge-art tge-art-${side}`} src={src} alt="" aria-hidden="true" loading="lazy" style={{width: size}} />;
}
