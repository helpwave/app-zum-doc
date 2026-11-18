FROM rust:1-bookworm AS build
WORKDIR /src
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
RUN useradd --system --no-create-home medical-product-search
COPY --from=build /src/target/release/medical-product-search /usr/local/bin/medical-product-search
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
USER medical-product-search
ENV BIND=0.0.0.0:8080
EXPOSE 8080
ENTRYPOINT ["docker-entrypoint.sh"]
