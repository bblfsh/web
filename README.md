# Dashboard [![GitHub version](https://badge.fury.io/gh/bblfsh%2Fdashboard.svg)](https://github.com/bblfsh/dashboard/releases) [![Build Status](https://travis-ci.org/bblfsh/dashboard.svg?branch=master)](https://travis-ci.org/bblfsh/dashboard)

Web dashboard for [Babelfish server](https://bblf.sh).

It's user-friendly tool for testing and research how babelfish parse code.

![Screenshot](images/screenshot.png?raw=true)

## Installation

Babelfish server (v2.5.0 or newer) is required for dashboard.
If you don't have it running, please read the [getting started](https://doc.bblf.sh/using-babelfish/getting-started.html) guide, to learn more about how to use and deploy a bblfsh server.

### Recomended way (using Docker)

```sh
docker run --privileged -d -p 9432:9432 --name bblfsh bblfsh/bblfshd
docker run -p 8080:80 --link bblfsh bblfsh/web -bblfsh-addr bblfsh:9432
```

When server starts dashboard will be available on http://localhost:8080

Please read the [getting started](https://doc.bblf.sh/using-babelfish/getting-started.html) guide, to learn more about how to use and deploy a bblfsh server, install drivers, etc.

### Standalone

If don't want to run **dashboard** using our *Docker* image you can download a binary from [releases](https://github.com/bblfsh/dashboard/releases) page and run it as

```sh
./bblfsh-web -bblfsh-addr <bblfsh-server-addr>
```

## Development

See relevant sections on [CONTRIBUTING.md](CONTRIBUTING.md) for information on application [architecture](CONTRIBUTING.md#Architecture) and how [build it](CONTRIBUTING.md#Development) from sources.

## Contributing

Please take a look at [CONTRIBUTING](CONTRIBUTING.md) file to see how to contribute in this project.


## License

GPLv3, see [LICENSE](LICENSE)
