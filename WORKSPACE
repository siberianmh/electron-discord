workspace(
    name = "electron-discord",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# NodeJS

http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "8a7c981217239085f78acc9898a1f7ba99af887c1996ceb3b4504655383a2c3c",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/4.0.0/rules_nodejs-4.0.0.tar.gz"],
)

load("@build_bazel_rules_nodejs//:index.bzl", "node_repositories", "yarn_install")

node_repositories(
    # TODO: Remove on the next rules_nodejs update
    node_repositories = {
        # 16.6.1
        "16.6.1-darwin_arm64": ("node-v16.6.1-darwin-arm64.tar.gz", "node-v16.6.1-darwin-arm64", "8b766a2bcc686f968146b09892f24cfbeaebb547a4d50744d9af80def5221613"),
        "16.6.1-darwin_amd64": ("node-v16.6.1-darwin-x64.tar.gz", "node-v16.6.1-darwin-x64", "bca84deb7bf6c57537b3af44997d985045c95b5048fc5665cdc7f54d5c147516"),
        "16.6.1-linux_arm64": ("node-v16.6.1-linux-arm64.tar.xz", "node-v16.6.1-linux-arm64", "59867dccc1f392416e9301a94b9df19faa38d0b0d1d2f1cea174835dff1a1cb0"),
        "16.6.1-linux_s390x": ("node-v16.6.1-linux-s390x.tar.xz", "node-v16.6.1-linux-s390x", "878cb8dfe48312fe40ab9fc320395e8322e8d9e1db4821539dcc6e2b006d8616"),
        "16.6.1-linux_amd64": ("node-v16.6.1-linux-x64.tar.xz", "node-v16.6.1-linux-x64", "ff95e86c3161859251cf659a76be63d99fc45e2380addf634812e5afebac961a"),
        "16.6.1-windows_amd64": ("node-v16.6.1-win-x64.zip", "node-v16.6.1-win-x64", "ec5dce1e182172cc7edc8d56c377f4d106232b2b14127bd2a1565497448504e9"),
    },
    node_version = "16.6.1",
    package_json = ["//:package.json"],
    yarn_version = "1.22.10",
)

yarn_install(
    name = "npm",
    package_json = "//:package.json",
    strict_visibility = False,
    yarn_lock = "//:yarn.lock",
)

# Docker

http_archive(
    name = "io_bazel_rules_docker",
    sha256 = "407e88c8ad7f3847d34391e2bb90e56fca8fea023fb9f48573134fdeefac2f04",
    strip_prefix = "rules_docker-e5368f9c425854ddb5af31624f0a6b99a0d3f1fb",
    urls = ["https://github.com/bazelbuild/rules_docker/archive/e5368f9c425854ddb5af31624f0a6b99a0d3f1fb.tar.gz"],
)

load(
    "@io_bazel_rules_docker//repositories:repositories.bzl",
    container_repositories = "repositories",
)

container_repositories()

load(
    "@io_bazel_rules_docker//nodejs:image.bzl",
    _nodejs_image_repos = "repositories",
)

_nodejs_image_repos()
