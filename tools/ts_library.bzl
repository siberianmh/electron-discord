load("@npm//@bazel/typescript:index.bzl", native_ts_library = "ts_library")

def ts_library(**kwargs):
    native_ts_library(
        devmode_target = "es2018",
        prodmode_target = "es2018",
        devmode_module = "commonjs",
        prodmode_module = "commonjs",
        **kwargs
    )
