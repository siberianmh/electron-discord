load("//:tools/ts_utils.bzl", "ts_project")
load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")
load("@io_bazel_rules_docker//nodejs:image.bzl", "nodejs_image")
load("@io_bazel_rules_docker//container:container.bzl", "container_push")

package(default_visibility = ["//visibility:public"])

ts_project(
    name = "the-board",
    srcs = glob(["src/**/*.ts"]),
    deps = [
        "@npm//@types/humanize-duration",
        "@npm//@types/node",
        "@npm//discord.js",
        "@npm//dotenv",
        "@npm//humanize-duration",
        "@npm//ioredis",
        "@npm//lunawork",
        "@npm//mysql2",
        "@npm//reflect-metadata",
        "@npm//typeorm",
    ],
)

nodejs_binary(
    name = "serve",
    data = [
        ":the-board",
    ],
    entry_point = ":src/index.ts",
)

nodejs_image(
    name = "docker",
    data = [
        ":the-board",
    ],
    entry_point = ":src/index.ts",
)

container_push(
    name = "push",
    format = "Docker",
    image = ":docker",
    registry = "ghcr.io",
    repository = "siberianmh/the-board-bot",
    tag = "latest",
)
