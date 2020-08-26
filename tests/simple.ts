import assert from 'assert'
import {
    getWorkspaceDependencies,
    makeDiagram,
    writeImage,
} from '../src/support'
import { readFileSync } from 'fs'
import path, { dirname } from 'path'

const packageJsonPath = 'tests/example-workspace/package.json'
const cwd = path.resolve(dirname(packageJsonPath))
const packageJSON = JSON.parse(readFileSync(packageJsonPath).toString())

it('getDependencies', async () => {
    const deps = await getWorkspaceDependencies({
        packageJSON,
        cwd,
    })
    console.log(deps)
})
it('makeDiagram', async () => {
    const depsMap = await getWorkspaceDependencies({
        packageJSON,
        cwd,
    })
    const graph = await makeDiagram({ depsMap, cwd })
    console.log(graph.to_dot())
})
it('writeImage', async () => {
    const depsMap = await getWorkspaceDependencies({
        packageJSON,
        cwd,
    })
    const graph = await makeDiagram({ depsMap, cwd })
    await writeImage(graph, 'test.png')
})
