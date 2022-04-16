import type { Package, ParseResult, UpdateMode } from "../types"

const filterDeps = (dep: Package, mode: UpdateMode) => {
    return Boolean(dep.after?.versionFixed)
        && Boolean(dep.after?.versionRaw)
        && ((mode === 'fix' && dep.before.versionFixed !== dep.after.versionFixed) || (mode !== 'fix' && dep.before.versionRaw !== dep.after.versionRaw))
}

export const getNpmInstallCommand = (updateInfo: ParseResult, mode: UpdateMode) => {
    if (!updateInfo) {
        return 'Waiting parse result'
    }

    // Keep changed only
    const dependencies = (updateInfo.dependencies || []).filter((dep) => filterDeps(dep, mode))
    const devDependencies = (updateInfo.devDependencies || []).filter((dep) => filterDeps(dep, mode))
    const peerDependencies = (updateInfo.peerDependencies || []).filter((dep) => filterDeps(dep, mode))

    const newDepsFixed = dependencies.map((p) => `${p.name}@${p.after.versionFixed}`).join(' ')
    const newDepsRaw = dependencies.map((p) => `${p.name}@${p.after.versionRaw}`).join(' ')

    const newDevDepsFixed = devDependencies.map((p) => `${p.name}@${p.after.versionFixed}`).join(' ')
    const newDevDepsRaw = devDependencies.map((p) => `${p.name}@${p.after.versionRaw}`).join(' ')

    const newPeerDepsFixed = peerDependencies.map((p) => `${p.name}@${p.after.versionFixed}`).join(' ')
    const newPeerDepsRaw = peerDependencies.map((p) => `${p.name}@${p.after.versionRaw}`).join(' ')

    const commandParts = [
        'npm i',
        ...mode === 'fix' ? ['-E'] : [],
        ...mode === 'fix' ? newDepsFixed : newDepsRaw,
        ...mode === 'fix' ? newDevDepsFixed : newDevDepsRaw,
        ...mode === 'fix' ? newPeerDepsFixed : newPeerDepsRaw,
    ]

    return commandParts.join(' ')
}
