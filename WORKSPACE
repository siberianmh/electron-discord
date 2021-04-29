workspace(
    name = "electron-discord",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# NodeJS

http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "a160d9ac88f2aebda2aa995de3fa3171300c076f06ad1d7c2e1385728b8442fa",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/3.4.1/rules_nodejs-3.4.1.tar.gz"],
)

load("@build_bazel_rules_nodejs//:index.bzl", "node_repositories", "yarn_install")

node_repositories(
    node_version = "15.0.0",
    package_json = ["//:package.json"],
    yarn_version = "1.22.4",
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
    sha256 = "7d992277f980be66f4772248ecc8c17d0aa854008117a9a30affe8602b06a6a2",
    strip_prefix = "rules_docker-3fc4b0a177dd36ee0d6f0c8b943fd5d97597ef10",
    urls = ["https://github.com/bazelbuild/rules_docker/archive/3fc4b0a177dd36ee0d6f0c8b943fd5d97597ef10.tar.gz"],
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
