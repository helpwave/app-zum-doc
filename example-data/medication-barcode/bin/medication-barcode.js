#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const cli = fileURLToPath(new URL('../src/cli.ts', import.meta.url))
const result = spawnSync(process.execPath, [
  '--experimental-strip-types',
  '--disable-warning=ExperimentalWarning',
  cli,
  ...process.argv.slice(2),
], { stdio: 'inherit' })

process.exit(result.status ?? 1)
