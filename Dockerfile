FROM debian:stretch-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends --no-install-suggests \
    ca-certificates \
    libxml2 \
    && apt-get clean
ADD bin/bblfsh-dashboard /bin/bblfsh-dashboard
ENTRYPOINT ["/bin/bblfsh-dashboard", "-addr", ":80"]
