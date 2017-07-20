FROM alpine:3.6

ADD ./bin /bin/

CMD /bin/bblfsh-dashboard -addr $ADDR -bblfsh-addr $BBLFSH_ADDR
