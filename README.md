# Dashboard [![GitHub version](https://badge.fury.io/gh/bblfsh%2Fdashboard.svg)](https://github.com/bblfsh/dashboard/releases) [![Build Status](https://travis-ci.org/bblfsh/dashboard.svg?branch=master)](https://travis-ci.org/bblfsh/dashboard)


## Installation

The easiest way to deploy **dashboard** is using *Docker*.

```sh
docker run -p 8080:80 bblfsh/dashboard -bblfsh-addr <bblfsh-server-addr>
```

If you don't have a bblfsh server running you can execute the dashboard and the server using the following command:

```sh
docker run --privileged -d -p 9432:9432 --name bblfsh bblfsh/server
docker run -p 8080:80 --link bblfsh bblfsh/dashboard -bblfsh-addr bblfsh:9432
```

Please read the [getting started](https://doc.bblf.sh/user/getting-started.html) guide, to learn more about how to use and deploy a bblfsh server.

If don't want to run **dashboard** using our *Docker* image you can download a binary from [releases](https://github.com/bblfsh/dashboard) page.

## License

GPLv3, see [LICENSE](LICENSE)
