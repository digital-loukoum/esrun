# esrun
Execute your Typescript or modern Javascript files without having to use a bundler. This is useful for quick demonstrations or when launching your tests written in Typescript.

This library is a thin wrapper around [esbuild](https://github.com/evanw/esbuild) which compiles Typescript almost instantly.

## Usage

Install the library globally or locally with your favorite package manager.

```
npm i -D esrun
```

Then you can execute any Typescript file in the same way Node would execute a Javascript file.

```
esrun foo.ts
```

You can pass arguments to the process :

```
esrun foo.ts --option=bar
```

The file dependencies will be bundled and executed as well.

## API

The library exports a single function that you can use to programmatically execute a Typescript file.

``` ts
import esrun from '@digitak/esrun'

esrun(filePath: string, ...arguments: string[]): unknown
```