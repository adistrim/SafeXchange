FROM rust:1.85.0-alpine3.21 as builder

WORKDIR /usr/src/app
COPY . .

RUN apk add --no-cache musl-dev perl-utils make curl pkgconf openssl-dev openssl-libs-static

RUN cargo install --locked --path .

FROM alpine:3.21

COPY --from=builder /usr/local/cargo/bin/server-v2 /usr/local/bin/server-v2

EXPOSE 8000

CMD [ "server-v2" ]
