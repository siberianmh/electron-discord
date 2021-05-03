workspace(
    name = "electron-discord",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# NodeJS

http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "65067dcad93a61deb593be7d3d9a32a4577d09665536d8da536d731da5cd15e2",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/3.4.2/rules_nodejs-3.4.2.tar.gz"],
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
    sha256 = "2c8bdba99157c675f6ed6ee19e04c741b52ec8d03d908c4cb44cfd65746a4418",
    strip_prefix = "rules_docker-d18033b7eb3429a55dc4a579b5c19af57ab25e5f",
    urls = ["https://github.com/bazelbuild/rules_docker/archive/d18033b7eb3429a55dc4a579b5c19af57ab25e5f.tar.gz"],
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
