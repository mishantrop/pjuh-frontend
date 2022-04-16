export enum DependencyCategory {
  dependencies = 'dependencies',
  devDependencies = 'devDependencies',
  peerDependencies = 'peerDependencies',
}

export type VersionType = '' | '^' | '~'
export type DependencyType = 'prod' | 'dev' | 'peer' | 'optional'

export type UpdateMode = 'SEMVER' | 'LATEST' | 'LATEST_FIXED'

export type Package = {
  name: string

  meta: {
    updateMode: UpdateMode
    type: DependencyType
    isUpdating: boolean
  }

  before: {
    fixed: string
    raw: string
    versionType: VersionType
  }

  after: {
    latest?: string
    latestFixed?: string
    semver?: string
    // semverFixed?: string
  }
}

export type ParseResult = {
  allDependencies: Package[]
}
