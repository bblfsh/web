FROM golang:1.8-alpine3.6 AS BUILD

# base deps
RUN apk --update upgrade && \
    apk add --no-cache make git curl ca-certificates bash \
    build-base libxml2-dev nodejs=6.10.3-r1 nodejs-npm && \
    npm install -g yarn

ADD . /go/src/bblfsh-dashboard
WORKDIR /go/src/bblfsh-dashboard

RUN make build
RUN make packages

FROM alpine:3.6
RUN apk --no-cache add ca-certificates libxml2 libgcc libstdc++
COPY --from=BUILD /go/src/bblfsh-dashboard/bin/bblfsh-dashboard /bin/
ENTRYPOINT ["/bin/bblfsh-dashboard", "-addr", ":80"]
