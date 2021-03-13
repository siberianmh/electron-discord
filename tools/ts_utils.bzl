load("@npm//@bazel/typescript:index.bzl", native_ts_project = "ts_project")

def ts_project(**kwargs):
    native_ts_project(
        tsconfig = {
            "compilerOptions": {
                "baseUrl": ".",
                "paths": {
                    "edis/*": ["*", "bazel-bin/*", "bazel-out", "bazel-genfiles/*"],
                },
                "target": "es2019",
                "allowUnreachableCode": False,
                "allowUnusedLabels": False,
                "noImplicitReturns": True,
                "module": "commonjs",
                "strict": True,
                "declaration": True,
                "jsx": "react",
                "strictPropertyInitialization": False,
                "emitDecoratorMetadata": True,
                "skipLibCheck": True,
                "experimentalDecorators": True,
                "sourceMap": True,
            },
            "exclude": ["bazel-*", "node_modules"],
        },
        **kwargs
    )
