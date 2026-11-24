#!/usr/bin/env node
// Load test for UniMatch using autocannon (run through npx, nothing to install).
//
//   node scripts/load-test.mjs                       # test https://unimatch.tech
//   node scripts/load-test.mjs http://localhost:5000 # test another host
//   DURATION=10 node scripts/load-test.mjs           # shorter runs (seconds)
//
// Each scenario is a read-only GET; nothing is written to the database.
// Results are printed as a table and saved to scripts/load-test-results.json.

import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const BASE = (process.argv[2] || 'https://unimatch.tech').replace(/\/$/, '')
const DURATION = Number(process.env.DURATION || 20)

const scenarios = [
  { name: 'Home page (Nginx static)', path: '/', connections: 100 },
  { name: 'Health check', path: '/api/health', connections: 100 },
  { name: 'Search "bach khoa"', path: '/api/universities/search?q=bach%20khoa', connections: 50 },
  { name: 'Filter options', path: '/api/universities/filter-options', connections: 50 },
  { name: 'University detail', path: '/api/universities/cong-nghe-thong-tin-dhqg', connections: 50 },
  { name: 'Compare 3 universities', path: '/api/universities/compare?slugs=cong-nghe-thong-tin-dhqg,bach-khoa-tphcm,khoa-hoc-tu-nhien-dhqg', connections: 50 },
  { name: 'AI advisor data (~1 MB)', path: '/api/universities/recommendation-data', connections: 10 },
]

function run(scenario) {
  const url = BASE + scenario.path
  // One command string through the shell so npx resolves on Windows too; every part is ours, not user input.
  const cmd = `npx --yes autocannon --json -c ${scenario.connections} -d ${DURATION} "${url}"`
  const res = spawnSync(cmd, { encoding: 'utf8', shell: true, maxBuffer: 64 * 1024 * 1024 })
  if (res.status !== 0) throw new Error(`autocannon failed for ${url}:\n${res.stderr}`)
  const r = JSON.parse(res.stdout)
  return {
    scenario: scenario.name,
    url,
    connections: scenario.connections,
    durationSec: DURATION,
    requests: r.requests.total,
    reqPerSecAvg: Math.round(r.requests.average),
    latencyAvgMs: Math.round(r.latency.average),
    latencyP50Ms: r.latency.p50,
    latencyP99Ms: r.latency.p99,
    non2xx: r.non2xx,
    errors: r.errors,
    timeouts: r.timeouts,
    throughputKBps: Math.round(r.throughput.average / 1024),
  }
}

console.log(`Load testing ${BASE}, ${DURATION}s per scenario\n`)
const results = []
for (const s of scenarios) {
  process.stdout.write(`- ${s.name} (${s.connections} connections)... `)
  const r = run(s)
  results.push(r)
  console.log(`${r.reqPerSecAvg} req/s, p99 ${r.latencyP99Ms} ms, errors ${r.errors + r.non2xx + r.timeouts}`)
}

console.log('')
console.table(results.map((r) => ({
  Scenario: r.scenario,
  Conn: r.connections,
  'Req/s': r.reqPerSecAvg,
  'Avg ms': r.latencyAvgMs,
  'p50 ms': r.latencyP50Ms,
  'p99 ms': r.latencyP99Ms,
  'Non-2xx': r.non2xx,
  Errors: r.errors + r.timeouts,
})))

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'load-test-results.json')
writeFileSync(out, JSON.stringify({ base: BASE, date: new Date().toISOString(), results }, null, 2))
console.log(`\nSaved ${out}`)
