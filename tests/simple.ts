import assert from 'assert'
import { getDependencies } from '../src/support'
import { readFileSync } from 'fs'
import path, { dirname } from 'path'

it('getDependencies', async () => {
    const packageJsonPath = 'tests/example-workspace/package.json'
    const packageJSON = JSON.parse(readFileSync(packageJsonPath).toString())

    const deps = await getDependencies({
        packageJSON,
        cwd: path.resolve(dirname(packageJsonPath)),
    })
    console.log(deps)
})
