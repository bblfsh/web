# Contributing Guidelines

source{d} babelfish web is [GPLv3](LICENSE) and accept
contributions via GitHub pull requests. This document outlines some of the
conventions on development workflow, commit message formatting, contact points,
and other resources to make it easier to get your contribution accepted.

## Certificate of Origin

By contributing to this project you agree to the [Developer Certificate of
Origin (DCO)](DCO). This document was created by the Linux Kernel community and is a
simple statement that you, as a contributor, have the legal right to make the
contribution.

In order to show your agreement with the DCO you should include at the end of commit message,
the following line: `Signed-off-by: John Doe <john.doe@example.com>`, using your real name.

This can be done easily using the [`-s`](https://github.com/git/git/blob/b2c150d3aa82f6583b9aadfecc5f8fa1c74aca09/Documentation/git-commit.txt#L154-L161) flag on the `git commit`.


## Support Channels

The official support channels, for both users and contributors, are:

- GitHub [issues](https://github.com/bblfsh/web/issues)*

*Before opening a new issue or submitting a new pull request, it's helpful to
search the project - it's likely that another user has already reported the
issue you're facing, or it's a known issue that we're already aware of.


## How to Contribute

Pull Requests (PRs) are the main and exclusive way to contribute to the project.
In order for a PR to be accepted it needs to pass a list of requirements:

- If the PR is a bug fix, it has to include a new unit test that fails before the patch is merged.
- If the PR is a new feature, it has to come with a suite of unit tests, that tests the new functionality.
- In any case, all the PRs have to pass the personal evaluation of at least one of the [maintainers](MAINTAINERS).


### Format of the commit message

Every commit message should describe what was changed and, if applicable, the GitHub issue it relates to:

```
Skip argument validations for unknown capabilities. Fixes #623
```

The format can be described more formally as follows:

```
<what changed>. [Fixes #<issue-number>]
```

## Architecture

The bblfsh web client application consists of 2 parts:

- Single page react application bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app)
- Go web server to proxy and transform requests to actual [bblfsh server](https://doc.bblf.sh/).

For production usage, all static files are served from the go server after being embedded in the server itself using go [go-bindata](https://github.com/jteeuwen/go-bindata).

### Dependencies

 - Golang 1.9
 - Node 8.x
 - Yarn 1.x

## Development

The web client is a Golang application, so in order for all further insturctions to work please make sure it's under `$GOPATH` in your filesystem.

The web client uses an intermediate API that connects to the bblfsh server and serves frontend assets.

Every time you change any source of the front assets, it is needed to regenerate the `server/asset/asset.go` containing the static files of the site.

It can be done running
```sh
make assets
```

### Access web client locally

To run it locally you can run:
```sh
make serve
```
(Do it every time you modify something in the sources to re-generate the `server/asset/asset.go` file, web client api, and to serve the updated web client itself)

And access web client through http://localhost:9999

### Run tests

Frontend tests:

```sh
yarn test
```

Server tests:

```sh
go test ./server/...
```

### Hot reloading mode

You can also run frontend in hot reloading mode:

```sh
yarn start
```

Web client will be available on http://localhost:3000

But it still requires go server on `9999` port to be available. The easiest way to run it is:

```sh
go run ./server/cmd/bblfsh-web/main.go
```

### Building the image locally

```sh
make packages
docker build -t bblfsh/web .
```
