# esrun
Execute your Typescript or modern Javascript files without having to use a bundler. This is useful for quick demonstrations or when launching your tests written in Typescript.

This library is a thin wrapper around [esbuild](https://github.com/evanw/esbuild) which compiles Typescript almost instantly.

## Usage

Install the library globally or locally with your favorite package manager.

```
npm i -D @digitak/esrun
```

Then you can execute any Typescript file in the same way Node would execute a Javascript file.

```py
esrun foo.ts
# or use shortened form :
esr foo.ts
```

You can pass arguments to the process :

```
esrun foo.ts --option=bar
```

All file dependencies will be bundled and executed as well.

If the given entry point is a folder, the following actions will be executed in order to find the right entry file :

- check if a package.json file exists with a `main` field. The entry file will be the value of the `main` field, relative to the package.json directory.
- check if an `index.ts` file exists in the given folder.
- check if an eponym file exists in the given folder.
- check if an eponym file with the `.ts` extension exists in the given folder.
- check if a `main.ts` file exists in the given folder.
- check if a `index.js` file exists in the given folder.
- check if an eponym file with the `.js` extension exists in the given folder.
- check if a `main.js` file exists in the given folder.

## API

The library exports a single function that you can use to programmatically execute a Typescript file.

``` ts
import esrun from '@digitak/esrun'

esrun(filePath: string, arguments: string[]): unknown
```