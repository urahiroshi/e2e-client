e2e-client
==========

e2e-client is client application for [e2e-server](https://github.com/urahiroshi/e2e-server).

It enables to write End-To-End test by yaml files.

## Requirements

- Node.js 8.0+

## Usage

### Initialize

```
$ npm run initialize
```

If you use it at first, call this command to initialize.
It sends `POST /project` API to e2e-server.

### Create Iteration

```
$ npm start
```

It sends `POST /project/:projectId/iterations` API to e2e-server and shows progress until iteration finished.

Trials in Iteration API body is created by yaml files in `./usecases` directory.
These files are converted to trial object, file path to usecasePath, file contents to usecase object.

Additionally, these files refer to `./partials` and `./parameters` directory to use common pattern or parameter.
For example, `{{> hoge/fuga }}` is converted by `./partials/hoge/fuga.yml` file, `{{ piyo }}` is converted by value defined by yaml files in `./parameters` directory, such as `piyo: http://example.com`.

It is based on [mustache.js](https://github.com/janl/mustache.js/), but there are different points.

- Keep indent of usecase file
- Don't escape

Parameters are passed by `--params` arguments too, such as `--params={piyo: http://example.com}`. It is useful for passing environment variables.

### Create Trial

```
$ npm start /path/to/usecase.yml
```

It sends `POST /trials` API to e2e-server and shows progress until trial finished.

Trial is created by given yaml file with `./partials`, `./parameters` directory. This is basically same to Create Iteration.

## License

MIT
