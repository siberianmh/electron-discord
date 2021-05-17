load("//:tools/ts_utils.bzl", "ts_project")
load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")

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
        "@npm//lunawork",
        "@npm//reflect-metadata",
    ],
)

nodejs_binary(
    name = "serve",
    data = [
        ":the-board",
    ],
    entry_point = ":src/index.ts",
)
