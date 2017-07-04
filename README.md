# Babelfish Dashboard

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

You can find the most recent version of this guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).


## Build, serve and test

Before running the build, serve or test commands, you need to install all dependencies running:

```yarn install```

### Run site server locally

for development purposes:

```yarn start```

### Run site tests

```yarn test```

if you just want to run the tests and exit, run:

```CI=true yarn test```

### Build the project

```yarn build```

## Server

For actually parsing the input of the user, you'll need to run the server as well.

### Install

```
go get ./server/...
go install ./server/...
```

### Run the server

```
dashboard-server -bblfsh-addr=0.0.0.0:9432
```

This requires a babelfish server running on the specified address. Please, refer to the [server project documentation](https://github.com/bblfsh/server) for instructions on how to run it.

### Test the server

```
go test ./server/...
```
