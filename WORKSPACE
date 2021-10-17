workspace(
    name = "electron-discord",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# NodeJS

http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "3635797a96c7bfcd0d265dacd722a07335e64d6ded9834af8d3f1b7ba5a25bba",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/4.3.0/rules_nodejs-4.3.0.tar.gz"],
)

load("@build_bazel_rules_nodejs//:index.bzl", "node_repositories", "yarn_install")

node_repositories(
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
    sha256 = "2b72a72532e2ca0c3991b9f4775c191f9ab24780c72a232c32296af40e31b6ee",
    strip_prefix = "rules_docker-af2b074cc8f488e0dcec6230c63c2a7c34cf3dff",
    urls = ["https://github.com/bazelbuild/rules_docker/archive/af2b074cc8f488e0dcec6230c63c2a7c34cf3dff.tar.gz"],
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
