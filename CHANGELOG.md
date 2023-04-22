## 3.2.24
- Add `esuilbOptions` to the `esrun` function.

## 3.2.23
- Strip shebangs

## 3.2.22
- Don't use crypto anymore (not compatible for old node versions), use timestamp instead

## 3.2.21
- Use crypto.getRandomUUID() and remove deprecated cuid dependency
- Generate source maps for better debugging

## 3.2.20
- Fix temporary file creation for windows and old node versions

## 3.2.19
- Add sudo mode

## 3.2.18
- Update esbuild version from `0.14` to `0.17`

## 3.2.17
- Use latest grubber version that fixes comments with backticks

## 3.2.16
- Fix Windows bug when running esrun from a npm script

## 3.2.15
- Re-add used dependency on cuid

## 3.2.14
- Fix a rare bug where esbuild would need a require function. Use `createRequire()` from node to emulate the require function
- Remove unused dependency on cuid (is a dev dependency only)

## 3.2.13
- Fix a bug on temporary file mode if node_modules folder does not exist

## 3.2.12
- Fix usage with interactive CLI
- On windows, the default mode creates a temporary flie that is then executed

## 3.2.11
- Improve documentation for CLI parameters
- Add an error message when trying to use `--tsconfig` parameter with no value

## 3.2.10
- Fix file watching that would work only once on some OS
- CLI arguments are passed using the '=' instead of ':' (the colon still work for retro compatibility)
- You can now pass custom node's cli options by prefixing your option name with `--node-`. Example: `--node-max-old-space-size=4096`

## 3.2.9
- Fix an error with Windows when passing the code to node. Using stdin now instead of a cli argument. (thanks to **@vendethiel** for the fix)
- Remove error swallowing that could happen when the node process itself crashes
- Add a link to the changelog in the readme

## 3.2.8
- New strategy to detect external dependencies. Now check if paths are inside a parent `node_modules` directory instead of checking if the import start with ".", "/", "~"n "@/" or "$". The previous strategy used to fail for typescript aliases that didn't start with "@/", "~" or "$".

## 3.2.7
- Update EsBuild version to `0.14`

## 3.2.6
- Fix `.mts` and `.cjs` extensions
- Better file watching. Do not use custom plugin anymore but EsBuild's metafile
- Remove unused dependency `anymatch`
- Re-watching updated dependencies is cleaner and does not need a debounce anymore (though it is sill kept as it can be useful in some cases)

## 3.2.5
- Add `--tsconfig:path` cli option

## 3.2.4
- Add support for file constants `__dirname` and `__filename`

## 3.2.3
- Add a message when calling cli with no arguments
- Cli now catches esrun errors and log them instead of throwing

## 3.2.2
- Add `beforeRun` and `afterRun` events

## 3.2.1
- Add `preserveConsole` option to prevent console clear on watch mode
- Add CI/CD with version auto-bumping
- Make CLI options more extensible
- Starting this changelog 🎉
