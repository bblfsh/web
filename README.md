# Babelfish web [![GitHub version](https://badge.fury.io/gh/bblfsh%web.svg)](https://github.com/bblfsh/web/releases) [![Build Status](https://travis-ci.org/bblfsh/web.svg?branch=master)](https://travis-ci.org/bblfsh/web)

Web client for [Babelfish server](https://bblf.sh).

It's a user-friendly tool for testing and studying how Babelfish parses source code.

![Screenshot](images/screenshot.png?raw=true)

## Installation

Babelfish server (v2.5.0 or newer) is required.
If you don't have it running please read the [getting started](https://doc.bblf.sh/using-babelfish/getting-started.html) guide. You will learn how to use and deploy a bblfsh server.

### Recomended way (using Docker)

```sh
docker run --privileged -d -p 9432:9432 --name bblfsh bblfsh/bblfshd
docker run -p 8080:80 --link bblfsh bblfsh/web -bblfsh-addr bblfsh:9432
```

When the server starts, the web client will be available on http://localhost:8080

Please read the [getting started](https://doc.bblf.sh/using-babelfish/getting-started.html) guide on how to use and deploy the bblfshd server, how to install drivers, etc.

### Standalone

If you don't want to run the **web client** using our *Docker* image you can download a binary from the [releases page](https://github.com/bblfsh/web/releases) and run it instead:

```sh
./bblfsh-web -bblfsh-addr <bblfsh-server-addr>
```

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md). There is information about the [application architecture](CONTRIBUTING.md#Architecture) and how to [build](CONTRIBUTING.md#Development) from sources.

## Contributing

Please take a look at [CONTRIBUTING](CONTRIBUTING.md) file to see how to contribute in this project.

## License

GPLv3, see [LICENSE](LICENSE).
