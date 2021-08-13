load("//:tools/ts_utils.bzl", "ts_project")
load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")
load("@io_bazel_rules_docker//nodejs:image.bzl", "nodejs_image")
load("@io_bazel_rules_docker//container:container.bzl", "container_push")

package(default_visibility = ["//visibility:public"])

ts_project(
    name = "server",
    srcs = glob(["src/**/*.ts"]),
    deps = [
        "@npm//@sentry/node",
        "@npm//@sentry/tracing",
        "@npm//@types/express",
        "@npm//@types/node",
        "@npm//axios",
        "@npm//express",
        "@npm//ioredis",
        "@npm//mysql2",
        "@npm//reflect-metadata",
        "@npm//typeorm",
    ],
)

nodejs_binary(
    name = "serve",
    data = [
        ":server",
    ],
    entry_point = ":src/index.ts",
)

nodejs_image(
    name = "docker",
    data = [
        ":server",
    ],
    entry_point = ":src/index.ts",
)

container_push(
    name = "push-server",
    format = "Docker",
    image = ":docker",
    registry = "ghcr.io",
    repository = "siberianmh/edis-server",
    tag = "latest",
)
