// Fails the build if dist imports anything from @solidjs/web beyond the names
// that are safe to evaluate on a server.
//
// @solidjs/web's server build replaces client-only exports with stubs that throw
// on call. Because those throw at call time rather than at import time, an
// accidental client-only import does not fail the build or the browser tests —
// it fails at runtime, under SSR, in a consumer's app. This check moves that
// failure to here.
//
// The package compiles exactly one JSX site: the <Context value> provider in
// createStoreContext.tsx, which becomes a createComponent call. So the expected
// surface is tiny and any growth in it is worth a deliberate look.

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const SSR_SAFE = new Set(['createComponent', 'memo'])
const DIST = new URL('../dist/', import.meta.url).pathname

/** Matches `import { a, b as c } from "@solidjs/web"` in built ESM output. */
const IMPORT_RE =
  /import\s*\{([^}]*)\}\s*from\s*["']@solidjs\/web["']/g
/** Matches a side-effect or namespace import, which we never expect. */
const OPAQUE_IMPORT_RE =
  /import\s+(?:\*\s*as\s+\w+\s+from\s*)?["']@solidjs\/web["']/g

function jsFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return jsFiles(path)
    return entry.name.endsWith('.js') ? [path] : []
  })
}

const violations = []
const seen = new Set()

for (const file of jsFiles(DIST)) {
  const source = readFileSync(file, 'utf8')

  for (const [, clause] of source.matchAll(IMPORT_RE)) {
    for (const binding of clause.split(',')) {
      const imported = binding.trim().split(/\s+as\s+/)[0]?.trim()
      if (!imported) continue
      seen.add(imported)
      if (!SSR_SAFE.has(imported)) {
        violations.push(`${file}: imports \`${imported}\` from @solidjs/web`)
      }
    }
  }

  for (const [match] of source.matchAll(OPAQUE_IMPORT_RE)) {
    violations.push(`${file}: opaque @solidjs/web import \`${match}\``)
  }
}

if (violations.length > 0) {
  console.error(
    'dist is not SSR-safe. Allowed @solidjs/web imports: ' +
      `${[...SSR_SAFE].join(', ')}\n`,
  )
  for (const violation of violations) console.error(`  - ${violation}`)
  console.error(
    '\nIf a new import is genuinely server-safe, add it to SSR_SAFE with a note.',
  )
  process.exit(1)
}

console.log(
  `dist is SSR-safe (@solidjs/web imports: ${[...seen].join(', ') || 'none'})`,
)
