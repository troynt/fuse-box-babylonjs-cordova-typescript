import {
    FuseBox,
    Sparky,
    CopyPlugin,
    EnvPlugin,
    JSONPlugin,
    WebIndexPlugin,
    ImageBase64Plugin,
    QuantumPlugin
} from "fuse-box";

import { TypeHelper } from 'fuse-box-typechecker'

import * as path from 'path';
import * as fs from 'fs';

import {execSync, exec } from 'child_process';

let clientBundle;
const root = path.resolve(__dirname, '..');

const directory = {
    src: path.join(root, 'src'),
    www: path.join(root, 'www'),
    node_modules: path.join(root, 'node_modules')
};

interface IEnvVars {
    NODE_ENV: string;
}

const envVars: IEnvVars = {
    NODE_ENV: process.env.NODE_ENV || 'development'
};

const isProd = envVars.NODE_ENV === 'production';

console.log('NODE_ENV', envVars.NODE_ENV);

const options = {
    homeDir: directory.src,
    sourceMaps: {
        vendor: false,
        inline: true
    },
    debug: false,
    log: true,
    cache: true
};

const clientOptions = {
    ...options,
    target: "browser",
    output: `${directory.www}/$name.js`,
    hash: isProd,
    polyfillNonStandardDefaultUsage: true,
    plugins: [
        JSONPlugin(),
        CopyPlugin({
            files: ["*.babylon"],
            useDefault: false
        }),
        EnvPlugin(envVars),
        WebIndexPlugin({
            target: `index.html`,
            template: `${directory.src}/index.html`,
            path: '.'
        }),
        ImageBase64Plugin({
            useDefault: true
        }),
        CopyPlugin({
            files: ["*.png", "*.jpg", "*.html"],
            dest: 'public',
        })/*,
        QuantumPlugin({
            target: 'browser',
            replaceTypeOf: false,
            treeshake: isProd,
            uglify: isProd
        })*/
    ],
};

const fuse = FuseBox.init(clientOptions);

const addClientConfigToBundle = (bundle) => {

    const tsConfigPath = path.join(directory.src, 'tsconfig.json');

    console.log(tsConfigPath)

    bundle
        .tsConfig(tsConfigPath)

        .target("browser")
        .completed((proc) => {
            const typeChecker = TypeHelper({
                tsConfig: tsConfigPath,
                basePath: directory.src,
                name: `Type Checker`
            });

            typeChecker.runAsync();

        });

    return bundle;
};

Sparky.task('setup-bundles', [], () => {

    clientBundle = addClientConfigToBundle(fuse.bundle("js/game"))
        .instructions(`> index.ts`)

});

Sparky.task('add-watch', [], () => {;
    if( clientBundle ) {
        clientBundle
            .watch('src/**')
            .hmr();
        fuse.dev();
    }
});

Sparky.task('run', () => {
    fuse.run();
});

Sparky.task("build", ["setup-bundles", "run"], () => {});

Sparky.task("watch", ["setup-bundles", "add-watch", "run"], () => {});

Sparky.task("default", ["build"], () => {});

