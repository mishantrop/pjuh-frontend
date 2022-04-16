export enum DependencyCategory {
  dependencies = 'dependencies',
  devDependencies = 'devDependencies',
  peerDependencies = 'peerDependencies',
}

export type VersionType = '' | '^' | '~'

export enum UpdateMode {
  SEMVER = 'SEMVER',
  LATEST = 'LATEST',
  LATEST_FIXED = 'LATEST_FIXED',
}

export type Package = {
  name: string

  before: {
    fixed: string
    raw: string
    versionType: VersionType
  }

  after: {
    latest?: string
    latestFixed?: string
    semver?: string

    selected: UpdateMode
  }
}

export type ParseResult = {
  dependencies: Package[]
  devDependencies: Package[]
  peerDependencies: Package[]
}
