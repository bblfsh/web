FROM alpine:3.6

RUN apk add --no-cache device-mapper ca-certificates
ADD bin/bblfsh-dashboard /bin/bblfsh-dashboard
ENTRYPOINT ["/bin/bblfsh-dashboard", "-addr", ":80"]
