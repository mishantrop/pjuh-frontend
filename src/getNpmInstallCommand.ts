import type { ParseResult, UpdateMode } from "../types"

export const getNpmInstallCommand = (updateInfo: ParseResult) => {
    if (!updateInfo) {
        return 'Waiting parse result'
    }

    // const newDepsFixed = updateInfo.dependencies.map((p) => `${p.name}@${p.after.versionFixed}`).join(' ')
    // const newDepsRaw = updateInfo.dependencies.map((p) => `${p.name}@${p.after.versionRaw}`).join(' ')

    // const newDevDepsFixed = updateInfo.devDependencies.map((p) => `${p.name}@${p.after.versionFixed}`).join(' ')
    // const newDevDepsRaw = updateInfo.devDependencies.map((p) => `${p.name}@${p.after.versionRaw}`).join(' ')

    // const newPeerDepsFixed = updateInfo.peerDependencies.map((p) => `${p.name}@${p.after.versionFixed}`).join(' ')
    // const newPeerDepsRaw = updateInfo.peerDependencies.map((p) => `${p.name}@${p.after.versionRaw}`).join(' ')

    // const commandPartsSemver = [
    //     'npm i',
    //     ...mode === 'fix' ? ['-E'] : [],
    //     ...mode === 'fix' ? newDepsFixed : newDepsRaw,
    //     ...mode === 'fix' ? newDevDepsFixed : newDevDepsRaw,
    //     ...mode === 'fix' ? newPeerDepsFixed : newPeerDepsRaw,
    // ]

    // return commandParts.join(' ')
    return 'test'
}
