#!/usr/bin/env node

import yargs from 'yargs'
import path from 'path'
import { getWorkspaceDependencies } from './support'
import { readFileSync } from 'fs'

const argv = yargs
    .option('cwd', { type: 'string' })
    .option('verbose', { alias: 'v', type: 'boolean' })
    .help('help').argv

async function main() {
    const cwd = argv.cwd || process.cwd()
    const packageJSON = readFileSync(path.join(cwd, 'package.json'))
    const deps = await getWorkspaceDependencies({ packageJSON, cwd })
    console.log(deps)
}

main().catch((e) => console.error(argv.verbose ? e : e.message))
