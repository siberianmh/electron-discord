FROM rust:nightly as builder

RUN USER=root cargo new --bin uwufier-service
WORKDIR ./uwufier-service

COPY ./Cargo.lock ./Cargo.lock
COPY ./Cargo.toml ./Cargo.toml
RUN cargo build --release
