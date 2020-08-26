import mapWorkspaces from '@npmcli/map-workspaces'
import graphviz from 'graphviz'
import fs from 'fs'
import path from 'path'

export async function getWorkspaceDependencies({ cwd, packageJSON }) {
    const map: Map<string, string> = await mapWorkspaces({
        pkg: packageJSON,
        cwd,
    })
    return map
}

export async function makeDiagram({
    depsMap,
    cwd,
}: {
    depsMap: Map<string, string>
    cwd: string
}) {
    var g = graphviz.digraph('Dependency Graph')

    // Add node (ID: Hello)
    depsMap.forEach((_, name) => {
        const newNode = g.addNode(name)
    })
    await Promise.all(
        Array.from(depsMap.keys()).map(async (name) => {
            const packagePath = depsMap.get(name)

            const packageJSON = JSON.parse(
                await fs.promises
                    .readFile(path.resolve(cwd, packagePath, 'package.json'))
                    .then((x) => x.toString()),
            )
            const deps = getPackageDependencies({ packageJSON, depsMap })
            deps.forEach((depName) => {
                g.addEdge(name, depName)
            })
        }),
    )
    // var n1 = g.addNode('Hello')
    // n1.set('style', 'filled')
    // console.log(g.to_dot())

    // Add node (ID: World)
    // g.addNode('World')
    return g
}

function getPackageDependencies({
    packageJSON,
    depsMap,
}: {
    depsMap: Map<string, string>
    packageJSON
}) {
    const names = [
        ...Object.keys(packageJSON.dependencies || {}),
        ...Object.keys(packageJSON.devDependencies || {}),
        ...Object.keys(packageJSON.peerDependencies || {}),
    ]
    return names.filter((x) => depsMap.has(x))
}
