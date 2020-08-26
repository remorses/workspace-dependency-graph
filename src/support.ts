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
    var g = graphviz.digraph('G')

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
                const edge = g.addEdge(depName, name)
                edge.set('color', 'red')
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

export function writeImage(graph: graphviz.Graph, filePath) {
    // graph.setGraphVizPath('/usr/local/bin')
    return new Promise((resolve, reject) =>
        graph.render(
            'png',
            (data) => {
                fs.promises.writeFile(filePath, data).then(resolve)
            },
            reject,
        ),
    )
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
