const { test } = require('brittle')
const { matchSnapshot } = require('..')
const { matchSnapshotJSON } = require('..')
const { matchSnapshotCSS } = require('..')

test('works', async (t) => {
  matchSnapshot(t, 'hello world!')
  matchSnapshotJSON(t, {
    foo: 'bar',
    baz: 'qux'
  })
  matchSnapshotCSS(t, `body { color: red; }`)
})
