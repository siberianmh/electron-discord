import * as mongoose from 'mongoose'

const releaseSchema = new mongoose.Schema(
  {
    node_id: {
      type: String,
    },
    tag_name: {
      type: String,
    },
    name: {
      type: String,
    },
    prerelease: {
      type: Boolean,
    },
    published_at: {
      type: String,
    },
    version: {
      type: String,
    },
    npm_package_name: {
      type: String,
    },
    deps: {
      node: {
        type: String,
      },
      v8: {
        type: String,
      },
      uv: {
        type: String,
      },
      zlib: {
        type: String,
      },
      openssl: {
        type: String,
      },
      modules: {
        type: String,
      },
      chrome: {
        type: String,
      },
    },
    npm_dist_tags: {
      type: [],
    },
  },
  { autoCreate: true },
)

export const Releases = mongoose.model('Release', releaseSchema)
