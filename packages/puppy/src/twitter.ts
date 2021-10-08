import { IVersion } from './lib/types'
import { generateLink, getRightElectron } from './lib/utils'
import { Releases } from './models/releases'
import { twitter as twitterAPI } from './lib/twitter'
import axios from 'axios'

const MIN_DAYS = 1
const TWIT_NIGHTLY = process.env.TWIT_NIGHTLY || true

const getReleases = async () => {
  console.log('Getting new releases')
  const releases = await Releases.find()
  const now = new Date()
  const newReleases: Array<any> = []
  for (const release of releases) {
    const releaseDate = new Date(release.published_at)
    const diffTime = Math.abs(now.getTime() - releaseDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays <= MIN_DAYS) {
      newReleases.push(release)
    }
  }

  newReleases.sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published).getTime(),
  )
  return newReleases
}

const generateMessage = async (version: IVersion) => {
  if (version.npm_package_name === 'NFUSINGv0') {
    console.log('Found version whats doesnt published to npm, exiting')
    return
  }

  const { link, channel } = generateLink(version)
  const electron = getRightElectron(version)

  if (electron === 'electron-nightly' && !TWIT_NIGHTLY) {
    console.log('Tweeting about Nightly releases disabled!')
    return
  }

  const message = `There's a new @electronjs release available: ${version.version} is out now! 🐶

$ npm install ${electron}@${version.version}

🔗 Release notes (will be) available here:
${link}
`

  if (process.env.NODE_ENV !== 'development') {
    await sendTweet(message)
    if (channel === 'stable' || channel === 'beta' || channel === 'alpha') {
      await sendDiscord(version.version)
    }
  } else {
    return console.log(message)
  }
}

const sendTweet = async (text: string) => {
  console.log('Sending tweet :yay:')
  return await twitterAPI.post('statuses/update', { status: text })
}

const sendDiscord = async (version: string) => {
  console.log('Sending Discord :yay:')
  return await axios.post(
    'https://edis.sibapp.xyz/epuppy-hook',
    {
      version: version,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.EDIS_SERVER_TOKEN}`,
      },
    },
  )
}

export async function twitter() {
  const releases = await getReleases()
  if (releases.length === 0) {
    console.log('No releases found, exiting')
    return
  }
  await generateMessage(releases[0])
}
