## 3.2.7
- Fix `.mts` and `.cjs` extensions

## 3.2.6
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
