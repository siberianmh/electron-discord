export interface IVersion {
  readonly version: string
  readonly npm_package_name: string
  readonly npm_dist_tags: Array<string>
}

export type IChannels = 'stable' | 'beta' | 'alpha' | 'nightly'
