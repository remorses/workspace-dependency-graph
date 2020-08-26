#!/usr/bin/env node

import yargs from 'yargs'
import path from 'path'
import { getWorkspaceDependencies, makeDiagram, writeImage } from './support'
import { readFileSync } from 'fs'

const argv = yargs
    .option('cwd', { type: 'string' })
    .option('verbose', { alias: 'v', type: 'boolean' })
    .option('image', { type: 'string' })
    .help('help').argv

async function main() {
    const cwd = argv.cwd || process.cwd()
    const packageJSON = readFileSync(path.join(cwd, 'package.json'))
    const depsMap = await getWorkspaceDependencies({ packageJSON, cwd })
    const graph = await makeDiagram({
        cwd,
        depsMap,
    })
    console.log(graph.to_dot())
    if (argv.image) {
        await writeImage(graph, argv.image)
    }
    // console.log(deps)
}

main().catch((e) => console.error(argv.verbose ? e : e.message))
