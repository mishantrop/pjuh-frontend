import type { ParseResult } from "../types"

export const getNpmInstallCommand = (updateInfo: ParseResult) => {
    if (!updateInfo) {
        return 'Waiting parse result'
    }

    const npmInstallCommandSemver = ['npm i']
    const npmInstallCommandLatest = ['npm i']
    const npmInstallCommandLatestFixed = ['npm i -E']

    const allDeps = [...updateInfo.allDependencies.filter((d) => d.meta.isUpdating)]

    allDeps.forEach((pkg) => {
        if (pkg.meta.updateMode === 'SEMVER') {
            const full = `${pkg.name}@${pkg.after.semver}`
            npmInstallCommandSemver.push(full)
        } else if (pkg.meta.updateMode === 'LATEST') {
            const full = `${pkg.name}@${pkg.after.latest}`
            npmInstallCommandLatest.push(full)
        } else if (pkg.meta.updateMode === 'LATEST_FIXED') {
            const full = `${pkg.name}@${pkg.after.latestFixed}`
            npmInstallCommandLatestFixed.push(full)
        }
    })

    return [
        ...npmInstallCommandSemver.length > 1 ? [npmInstallCommandSemver.join(' ')] : [],
        ...npmInstallCommandLatest.length > 1 ? [npmInstallCommandLatest.join(' ')] : [],
        ...npmInstallCommandLatestFixed.length > 1 ? [npmInstallCommandLatestFixed.join(' ')] : [],
    ].join(' && ')
}
