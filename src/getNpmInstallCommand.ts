import type { ParseResult, UpdateMode } from "../types";

export const getNpmInstallCommand = (updateInfo: ParseResult, mode: UpdateMode) => {
    console.log('getNpmInstallCommand', updateInfo, mode);

    if (!updateInfo) {
        return 'Waiting parse result'
    }

    const dependencies = updateInfo.dependencies.filter((dep) => {
        dep.before.versionFixed !== dep.after.versionFixed
    })

    return `npm i ${mode === 'fix' ? '-E ' : ' '}${dependencies.map((p) => `${p.name}@${p.after.versionFixed}`).join(' ')}`
}
