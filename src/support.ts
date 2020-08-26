import mapWorkspaces from '@npmcli/map-workspaces'

export async function getDependencies({ cwd, packageJSON }) {
    const map: Map<string, string> = await mapWorkspaces({
        pkg: packageJSON,
        cwd,
    })
    return map
}
