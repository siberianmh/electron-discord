import { IVersion, IChannels } from './types'

export const generateLink = (
  version: IVersion,
): { link: string; channel: IChannels } => {
  console.log('Generating link for message')
  const url = 'https://electronjs.org/releases'

  let obj: { link: string; channel: IChannels } = {
    link: `${url}/stable#${version.version}`,
    channel: 'stable',
  }

  if (version.npm_dist_tags.includes('beta')) {
    obj = { link: `${url}/beta#${version.version}`, channel: 'beta' }
  } else if (version.npm_dist_tags.includes('nightly')) {
    obj = { link: `${url}/nightly#${version.version}`, channel: 'nightly' }
  } else if (version.npm_dist_tags.includes('stable')) {
    obj = {
      link: `${url}/stable#${version.version}`,
      channel: 'stable',
    }
  }

  return obj
}

export const getRightElectron = (version: IVersion) => {
  if (version.npm_dist_tags.includes('nightly')) {
    return 'electron-nightly'
  }

  return 'electron'
}
