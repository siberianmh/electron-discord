load("//:tools/ts_utils.bzl", "ts_project")
load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")
load("@io_bazel_rules_docker//nodejs:image.bzl", "nodejs_image")
load("@io_bazel_rules_docker//container:container.bzl", "container_push")

package(default_visibility = ["//visibility:public"])

filegroup(
    name = "tags-resources",
    srcs = glob(["src/resources/tags/**/*.md"]),
)

ts_project(
    name = "bot",
    srcs = glob(["src/**/*.ts"]),
    deps = [
        "@npm//@sentry/node",
        "@npm//@types/fs-extra",
        "@npm//@types/humanize-duration",
        "@npm//@types/ioredis",
        "@npm//@types/luxon",
        "@npm//@types/node",
        "@npm//@types/statsd-client",
        "@npm//algoliasearch",
        "@npm//axios",
        "@npm//cookiecord",
        "@npm//discord.js",
        "@npm//dotenv",
        "@npm//fs-extra",
        "@npm//gray-matter",
        "@npm//humanize-duration",
        "@npm//ioredis",
        "@npm//luxon",
        "@npm//parse-duration",
        "@npm//reflect-metadata",
        "@npm//statsd-client",
    ],
)

nodejs_binary(
    name = "serve",
    data = [
        ":bot",
        ":tags-resources",
    ],
    entry_point = ":src/index.ts",
)

nodejs_image(
    name = "docker-bot",
    data = [
        ":bot",
        ":tags-resources",
    ],
    entry_point = ":src/index.ts",
)

container_push(
    name = "push-bot",
    format = "Docker",
    image = ":docker-bot",
    registry = "ghcr.io",
    repository = "siberianmh/edis-bot",
    tag = "latest",
)
