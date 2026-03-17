const fs = require('fs')
const { join, basename } = require('path')
const process = require('process')
const { diffChars, diffCss, diffJson } = require('diff')

const green = '\x1b[32m'
const red = '\x1b[31m'
const reset = '\x1b[0m'
const dim = '\x1b[2m'

const HEADER_RE = /^=== (.+) ===$/
const UPDATE = process.argv.includes('--update') || process.argv.includes('-u')

const counters = {}
const fileCache = {}

function getCallerFile() {
  const err = new Error()
  const lines = err.stack.split('\n')

  for (const line of lines) {
    const match = line.match(
      /(?:at\s+.*?\s+\(|at\s+)(file:\/\/\/.+?|\/.*?|[A-Za-z]:\\.*?)(?::\d|[)])/
    )
    if (!match) continue

    let file = match[1]
    if (file.startsWith('file:///')) file = file.slice(7)
    if (file === __filename) continue

    return file
  }

  return null
}

function getSnapshotPath(callerFile) {
  const dir = join(callerFile, '..', '__snapshots__')
  const name = basename(callerFile).replace(/\.[^.]+$/, '') + '.snap'
  return { dir, file: join(dir, name) }
}

function serialize(snapshots) {
  let out = ''

  for (const [key, value] of Object.entries(snapshots)) {
    out += '=== ' + key + ' ===\n'
    out += value + '\n'
  }

  return out
}

function deserialize(content) {
  const snapshots = {}

  if (!content) return snapshots

  const lines = content.split('\n')
  let currentKey = null
  let currentLines = []

  for (const line of lines) {
    const match = line.match(HEADER_RE)

    if (match) {
      if (currentKey !== null) {
        snapshots[currentKey] = trimTrailingNewline(currentLines.join('\n'))
      }
      currentKey = match[1]
      currentLines = []
    } else if (currentKey !== null) {
      currentLines.push(line)
    }
  }

  if (currentKey !== null) {
    snapshots[currentKey] = trimTrailingNewline(currentLines.join('\n'))
  }

  return snapshots
}

function trimTrailingNewline(s) {
  return s.endsWith('\n') ? s.slice(0, -1) : s
}

function loadSnapshots(filePath) {
  if (fileCache[filePath]) return fileCache[filePath]

  let content = ''

  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf-8')
  }

  const snapshots = deserialize(content)
  fileCache[filePath] = snapshots

  return snapshots
}

function saveSnapshots(dir, filePath, snapshots) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  fs.writeFileSync(filePath, serialize(snapshots), 'utf-8')
}

function snapshot(t, source, matcher, desc) {
  const callerFile = getCallerFile()
  const { dir, file } = getSnapshotPath(callerFile)

  const countKey = file + ':' + t.name
  counters[countKey] = (counters[countKey] || 0) + 1

  const snapKey = t.name + ' > ' + (desc || counters[countKey])
  const snapshots = loadSnapshots(file)

  if (!(snapKey in snapshots) || UPDATE) {
    snapshots[snapKey] = source
    fileCache[file] = snapshots
    saveSnapshots(dir, file, snapshots)

    if (UPDATE) {
      t.pass('Snapshot updated: ' + snapKey)
    } else {
      t.pass('New snapshot created: ' + snapKey)
    }
    return
  }

  const existing = snapshots[snapKey]

  if (existing === source) {
    t.pass('Snapshot matches: ' + snapKey)
    return
  }

  const diff = matcher(existing, source)

  t.fail('Snapshot mismatch: ' + snapKey)
  process.stderr.write('\n' + dim + '  ' + snapKey + reset + '\n\n')

  for (const part of diff) {
    const text = part.added
      ? green + part.value + reset
      : part.removed
        ? red + part.value + reset
        : part.value

    process.stderr.write(text)
  }

  process.stderr.write('\n\n')
}

const matchSnapshot = (t, source, desc) => snapshot(t, source, diffChars, desc)
const matchSnapshotCSS = (t, source, desc) => snapshot(t, source, diffCss, desc)
const matchSnapshotJSON = (t, source, desc) =>
  snapshot(t, JSON.stringify(source, null, 2), diffJson, desc)

module.exports = { matchSnapshot, matchSnapshotCSS, matchSnapshotJSON }
