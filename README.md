# brittle-snapshot

Snapshot testing for [brittle](https://github.com/holepunchto/brittle). One snapshot file per test file, multiple snapshots per file.

## Install

```
npm i brittle-snapshot
```

## Usage

```js
const test = require('brittle')
const { matchSnapshot } = require('brittle-snapshot')

test('render heading', (t) => {
  const html = render('<h1>hello</h1>')

  matchSnapshot(t, html)
  matchSnapshot(t, render('<h1>world</h1>'), 'second heading')
})
```

Snapshots are written to a `__snapshots__` directory alongside the calling test file, named after it:

```
test/
  render.js
  __snapshots__/
    render.snap
```

Each `.snap` file contains all snapshots for that test file:

```
=== render heading > 1 ===
<h1>hello</h1>
=== render heading > second heading ===
<h1>world</h1>
```

## API

#### `matchSnapshot(t, source, [desc])`

Compare `source` against a stored snapshot using character-level diffing.

#### `matchSnapshotCSS(t, source, [desc])`

Compare using CSS-aware diffing.

#### `matchSnapshotJSON(t, source, [desc])`

Compare using JSON-aware diffing.

All functions take:

- `t` — a brittle test instance
- `source` — string to snapshot
- `desc` — optional label for the snapshot key (defaults to an auto-incrementing counter)

## Updating snapshots

Run with `--update` or `-u` to overwrite existing snapshots:

```
bare test/render.js --update
```

or

```
npm test -- --update
```

## License

Apache-2.0
