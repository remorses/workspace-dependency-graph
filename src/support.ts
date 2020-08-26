import mapWorkspaces from '@npmcli/map-workspaces'
import graphviz, { Graph } from 'graphviz'
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
    focus,
}: {
    depsMap: Map<string, string>
    cwd: string
    focus?: string
}) {
    var g = graphviz.digraph('G')

    // Add node (ID: Hello)
    depsMap.forEach((_, name) => {
        const newNode = g.addNode(name)
    })
    const nodesUsed = focus ? [focus] : []
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
                if (focus && ![depName, name].includes(focus)) {
                    return
                }
                if (focus) {
                    nodesUsed.push(focus === depName ? name : depName)
                }
                const edge = g.addEdge(depName, name)
                edge.set('color', 'red')
            })
        }),
    )
    let nodesNotUsed = Array.from(depsMap.keys()).filter(
        (x) => !nodesUsed.includes(x),
    )
    nodesNotUsed.forEach((name) => {
        removeNode(g, name, true)
    })
    // var n1 = g.addNode('Hello')
    // n1.set('style', 'filled')
    // console.log(g.to_dot())

    // Add node (ID: World)
    // g.addNode('World')
    return g
}

export function writeImage(graph: graphviz.Graph, filePath, imageType = '') {
    // graph.setGraphVizPath('/usr/local/bin')
    imageType = imageType || path.extname(filePath).replace('.', '')
    return new Promise((resolve, reject) =>
        graph.render(
            { type: imageType, G: { rankdir: 'LR' } },
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

export function removeNode(_graph: any, id: string, force?: boolean) {
    const graph = _graph as any

    if (force === true) {
        for (let i = 0; i < graph.edges.length; ++i) {
            if (!graph.edges[i]) {
                continue
            }
            if (
                graph.edges[i].nodeOne.id == id ||
                graph.edges[i].nodeTwo.id == id
            ) {
                delete graph.edges[i]
            }
        }
    }
    graph.nodes.removeItem(id)
}
