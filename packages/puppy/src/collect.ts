import * as semver from 'semver'
import { Octokit } from '@octokit/core'
import { paginateRest } from '@octokit/plugin-paginate-rest'
import axios from 'axios'
import { Releases } from './models/releases'

// `electron` was once a different module on npm. prior to 1.3.1 it was
// published as `electron-prebuilt`
const firstNpmVersion = '1.3.1'

const customOctokit = Octokit.plugin(paginateRest)
const github = new customOctokit({
  auth: process.env.GH_TOKEN,
})

export async function collect() {
  console.log('fetching list of `electron` releases on npm')
  const npmElectronData = await axios('https://registry.npmjs.com/electron', {
    responseType: 'json',
  })
  const npmVersions = Object.keys(npmElectronData.data.versions)
    // filter out old versions of `electron` that were actually a different module
    .filter((version) => semver.gte(version, firstNpmVersion))

  console.log('fetching list of `electron-prebuilt` releases on npm')
  const npmElectronPrebuiltData = await axios(
    'https://registry.npmjs.com/electron-prebuilt',
    { responseType: 'json' },
  )
  const npmVersionsPrebuilt = Object.keys(npmElectronPrebuiltData.data.versions)
    // filter out `electron-prebuilt` versions that were published in tandem with `electron` for a while
    .filter((version) => semver.lt(version, firstNpmVersion))

  console.log('fetching list of `electron-nightly` releases on npm')
  const npmElectronNightlyData = await axios(
    'https://registry.npmjs.com/electron-nightly',
    { responseType: 'json' },
  )
  const npmVersionsNightly = Object.keys(npmElectronNightlyData.data.versions)

  console.log('fetching npm dist-tags')
  const distTags = npmElectronData.data['dist-tags'] as string
  const npmDistTaggedVersions = Object.entries(distTags).reduce(
    (acc, tagAndVersion) => {
      const [tag, version] = tagAndVersion
      if (!tag.includes('nightly')) {
        let o = acc[version]
        if (!o) {
          acc[version] = o = []
        }
        o.push(tag)
      }
      return acc
    },
    {} as Record<string, Array<string>>,
  )
  const latestNightly = npmElectronNightlyData.data['dist-tags'].latest
  npmDistTaggedVersions[latestNightly] = ['nightly']
  console.log('fetched npmDistTaggedVersions"\n', npmDistTaggedVersions)

  console.log('fetching GitHub Releases page count')
  let releases: Array<any> = []
  releases = releases.concat(await fetchAllRepoReleases('electron'))
  releases = releases.concat(await fetchAllRepoReleases('nightlies'))
  console.log(`found ${releases.length} releases on GitHub`)

  console.log('fetching version data for deps like V8, Chromium, and Node.js')
  const { data: depData } = await axios(
    'https://electronjs.org/headers/index.json',
    { responseType: 'json' },
  )

  releases = releases
    .filter((release) => !release.draft)
    .filter((release) => semver.valid(release.tag_name.substring(1)))
    .map((release) => {
      // derive version from tag_name for semver comparisons
      release.version = release.tag_name.substring(1)

      // published to npm? electron? electron-prebuilt?
      if (npmVersions.includes(release.version)) {
        release.npm_package_name = 'electron'
      }
      if (npmVersionsPrebuilt.includes(release.version)) {
        release.npm_package_name = 'electron-prebuilt'
      }
      if (npmVersionsNightly.includes(release.version)) {
        release.npm_package_name = 'electron-nightly'
      }
      if (!release.npm_package_name) {
        checkNpmPackageName(release)
      }

      // weave in version data for V8, Chromium, Node.js, etc
      const deps = depData.find(
        (version: { version: any }) => version.version === release.version,
      )
      if (deps) {
        release.deps = deps
      }

      // apply dist tags from npm (usually `latest`, `beta` or `nightly`)
      release.npm_dist_tags = npmDistTaggedVersions[release.version] || []

      // Delete unneded things
      delete release.assets
      delete release.author
      delete release.body
      delete release.url
      delete release.assets_url
      delete release.upload_url
      delete release.draft
      delete release.html_url
      delete release.created_at
      delete release.target_commitish
      delete release.id
      delete release.tarball_url
      delete release.zipball_url
      if (release.deps) {
        delete release.deps.version
        delete release.deps.date
        delete release.deps.files
      }
      delete release.total_downloads

      return release
    })
    // highest version first
    .sort((a, b) => semver.compare(b.version, a.version))

  // Compare the old data to the new data
  // and abort the build early if key data hasn't changed.
  const old = await Releases.find()

  let tagsChanged: boolean = false
  for (const tag of ['latest', 'beta', 'nightly']) {
    const oldVersion = findVersionForTag(old, tag, 'index.json')
    const newVersion = findVersionForTag(
      releases,
      tag,
      'electron/electron and electron/nightlies repos',
    )
    if (oldVersion !== newVersion) {
      tagsChanged = true
    }
  }

  const oldNpmCount = old.filter(
    (release) => release.npm_package_name === 'electron',
  ).length
  const newNpmCount = releases.filter(
    (release) => release.npm_package_name === 'electron',
  ).length
  const releaseWithoutPackageName = releases.find(
    (release) => !release.npm_package_name,
  )

  if (releaseWithoutPackageName) {
    console.log(
      `Electron ${releaseWithoutPackageName.version} doesn't published to npm. exiting`,
    )
    return
  }

  if (
    old.length === releases.length &&
    oldNpmCount === newNpmCount &&
    !tagsChanged
  ) {
    console.log('module content is already up to date. exiting.')
    return
  }

  await Releases.insertMany(releases)
  return
}

const findVersionForTag = (releases: any, tag: string, source: string) => {
  for (const release of releases) {
    const tags = release.npm_dist_tags
    if (tags && tags.includes(tag)) {
      return release.version
    }
  }
  throw new Error(`No release with tag "${tag}" found in "${source}"`)
}

const checkNpmPackageName = (release: any) => {
  if (release.name.includes('atom-shell')) {
    return (release.npm_package_name = 'electron-prebuilt')
  }

  return (release.npm_package_name = 'NFUSINGv0')
}

const fetchAllRepoReleases = async (repo: string) => {
  console.log(`fetching release data from GitHub for repo "${repo}"`)
  return await github.paginate('GET /repos/{owner}/{repo}/releases', {
    owner: 'electron',
    repo,
    per_page: 100,
  })
}
