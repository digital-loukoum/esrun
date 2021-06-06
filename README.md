# esrun
**esrun** is a "work out of the box" library to execute Typescript (as well as modern Javascript with decorators and stuff) without having to use a bundler. This is useful for quick demonstrations or when launching your tests written in Typescript.

This library is a thin wrapper around [esbuild](https://github.com/evanw/esbuild) which compiles Typescript almost instantly.

The harder work to run typescript is to deal with dependencies. For example, you may need to import other Typescript files, but also libraries written in Javascript and using either the CJS or the ESM format. All these use cases should be considered.

**esrun** is able to handle all the annoying stuff and make things work as you would expect.

## Usage

### Global installation

Install the library globally with your favorite package manager:


```shell
npm i -g @digitak/esrun
```

Then you can execute any Typescript file in the same way Node would execute a Javascript file:

```shell
esrun foo.ts
```

You can pass arguments like any process:

```shell
esrun foo.ts --option=bar --verbose -S
```

All file dependencies will be bundled and executed as well.

External module dependencies won't be bundled, it's up to the `node` engine to resolve dependencies.


### Local installation

Install the library locally with your favorite package manager.

```shell
npm i -D @digitak/esrun
```

Then you can use it in your `package.json` scripts:

```json
{
   "scripts": {
      "test": "esrun test"
   }
}
```

Running `npm run test` will run the first file that exists in the following list:

- `/test.ts`
- `/test/index.ts`
- `/test/test.ts`
- `/test/main.ts`
- `/test.js`
- `/test/index.js`
- `/test/test.js`
- `/test/main.js`


### Watch mode

You can also execute **esrun** in watch mode.

In watch mode, your file will automatically be re-executed every time itself or one of its dependencies is updated.

```shell
esrun --watch foo.ts
```

> The `--watch` (or `-w`) option must be placed before the path of the file to execute.
If you place it after the file path, it will be passed as an argument to `foo.ts` instead.

This feature is very useful when you are doing test-driven development. You can just run `esrun --watch test.ts` and enjoy a live output of your changes right into your console.

### Inspect mode

You can also execute **esrun** in inspect mode.

When run in inspect mode, your code will be connected to the Webkit DevTools to benefit the power of the browser console instead of the terminal console.

First, run your program in inspect mode:

```shell
esrun --inspect foo.ts
```

Then open `about:inspect` in a **Chrome** / **Brave** / **Edge** browser. You should see your program running in the *Remote targets* section.

Click on `Open dedicated DevTools for Node` and enjoy the browser console for your back-end program.

In case of troubleshooting, read the [node documentation](https://nodejs.org/en/docs/guides/debugging-getting-started/).

> Inspect and watch mode are alas not compatible yet.


### Importing a CJS module

If you import a CJS module (like the `typescript` library itself), it's likely that you will need to set the [esModuleInterop](https://www.typescriptlang.org/tsconfig#esModuleInterop) flag in your `tsconfig.json` file:

```json
{
	"compilerOptions": {
		"esModuleInterop": true
	}
}
```

This will suppress the import errors from the Typescript compiler and allow you to write `import ts from "typescript"` instead of `import * as ts from "typescript"` - the latest syntax being not standard ESM.


### Using a directory as an entry point
If the given entry point is a directory, the following actions will be executed in order to find the right entry file:

- check if a package.json file exists with a `main` field. The entry file will be the value of the `main` field, relative to the package.json directory.
- check if an `index.ts` file exists in the given directory.
- check if an eponym file exists in the given directory.
- check if an eponym file with the `.ts` extension exists in the given directory.
- check if a `main.ts` file exists in the given directory.
- check if a `index.js` file exists in the given directory.
- check if an eponym file with the `.js` extension exists in the given directory.
- check if a `main.js` file exists in the given directory.

## API

The library exports a single function that you can use to programmatically execute a Typescript file.

``` ts
import esrun from '@digitak/esrun'

esrun(filePath: string, argv: string[], watch = false): unknown
```
