import { spawnSync } from 'node:child_process'

const result = spawnSync('tsc', ['--noEmit', '--pretty', 'false'], {
  encoding: 'utf8',
})

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
const ours = output
  .split('\n')
  .filter((line) => line.includes('error TS') && !line.includes('node_modules'))

if (ours.length > 0) {
  console.error(ours.join('\n'))
  process.exit(1)
}
