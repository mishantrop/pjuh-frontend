export enum DependencyCategory {
  dependencies = 'dependencies',
  devDependencies = 'devDependencies',
  peerDependencies = 'peerDependencies',
}

export type VersionType = '' | '^' | '~'

export enum UpdateMode {
  KEEP = 'keep',
  FIX = 'fix',
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
  }
}

export type ParseResult = {
  dependencies: Package[]
  devDependencies: Package[]
  peerDependencies: Package[]
}
