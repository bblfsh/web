# Dashboard [![GitHub version](https://badge.fury.io/gh/bblfsh%2Fdashboard.svg)](https://github.com/bblfsh/dashboard/releases) [![Build Status](https://travis-ci.org/bblfsh/dashboard.svg?branch=master)](https://travis-ci.org/bblfsh/dashboard)


## Installation

The easiest way to deploy **dashboard** is using *Docker*.

```sh
docker run --publish 8080:80 --name bblfsh-dashboard bblfsh/dashboard -bblfsh-addr <bblfsh-server-addr>
```

If you don't have a bblfsh server running you can execute the dashboard and the server using the following commands:

```sh
DASHBOARD_PORT=8080; # port under the dashboard will be accessible
DAEMON=bblfsh-daemon; # container name given to the bblfsh daemon
DASHBOARD=bblfsh-dashboard; # container name given to the bblfsh dashboard
docker run --privileged --detach --publish 9432:9432 --name ${DAEMON} bblfsh/bblfshd;
docker exec -it ${DAEMON} bblfshctl driver install --all;
docker run --detach --publish ${DASHBOARD_PORT}:80 --name ${DASHBOARD} --link ${DAEMON} bblfsh/dashboard -bblfsh-addr ${DAEMON}:9432;
```

and then navigate to [http://localhost:${DASHBOARD_PORT}](http://localhost:8080)


Please read the [getting started](https://doc.bblf.sh/user/getting-started.html) guide, to learn more about how to use and deploy a bblfsh server.

If don't want to run **dashboard** using our *Docker* image you can download a binary from [releases](https://github.com/bblfsh/dashboard) page.

## Development

The dashboard uses an intermediate API that connects to the bblfsh server and serves the dashboard front assets.

Every time you change any source of the front assets, it is needed to regenerate the `server/asset/asset.go` containing the static files of the site.

It can be done running
```sh
make assets
```

### Access the dashboard locally

To run it locally you can run:
```sh
make serve
```
(Do it every time you modify something in the sources to re-generate the `server/asset/asset.go` file, the dashboard api, and to serve the updated dashboard itself)

And access the dashboard through http://localhost:9999

## License

GPLv3, see [LICENSE](LICENSE)
