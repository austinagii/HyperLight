FROM alpine:3.21 as build

RUN apk upgrade && apk add clang

WORKDIR /hyperlight 

COPY ./hyperlight/c .

RUN ["clang++", "-o", "/usr/local/bin/hyperlight", "main.cpp"]

CMD ["sh"]


FROM build as execute

COPY --from=build /usr/local/bin/hyperlight /usr/local/bin/hyperlight

CMD ["/usr/local/bin/hyperlight"]

