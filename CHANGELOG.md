## 3.2.10
- Fix watcher that would not work after the first time

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
