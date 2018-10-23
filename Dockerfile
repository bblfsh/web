FROM debian:stretch-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends --no-install-suggests \
    ca-certificates \
    libxml2 \
    && apt-get clean
ADD bin/bblfsh-web /bin/bblfsh-web
ENTRYPOINT ["/bin/bblfsh-web", "-addr", ":8080"]
