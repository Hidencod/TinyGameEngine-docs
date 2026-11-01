/**
 * Every behavior with its setting ids and defaults, straight from the engine's data (src/data/behaviors.json,
 * written by `npm run docs:data`), so the reference never lists settings the engine no longer has.
 */
import React from 'react';
import data from '@site/src/data/behaviors.json';

type Value = string | number | boolean;
const { defaults, info } = data as unknown as {
  defaults: Record<string, Record<string, Value>>;
  info: Record<string, { icon: string; title: string }>;
};

const show = (v: Value): React.ReactNode =>
  typeof v === 'string' ? (v === '' ? '(empty)' : <code>{v}</code>) : typeof v === 'number' && v < 0 ? `−${-v}` : String(v);

export default function BehaviorTable(): React.ReactElement {
  return (
    <table>
      <thead>
        <tr><th>Behavior</th><th>Type id</th><th>Setting id = default</th></tr>
      </thead>
      <tbody>
        {Object.entries(defaults).map(([type, params]) => (
          <tr key={type}>
            <td>{info[type] ? `${info[type].icon} ${info[type].title}` : type}</td>
            <td><code>{type}</code></td>
            <td>
              {Object.entries(params).map(([k, v], i) => (
                <React.Fragment key={k}>{i > 0 ? ' · ' : ''}<code>{k}</code> = {show(v)}</React.Fragment>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
