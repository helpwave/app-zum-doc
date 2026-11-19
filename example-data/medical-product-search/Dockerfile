FROM postgres:16-bookworm
COPY seed.sh /seed.sh
COPY seed.sql /seed.sql
RUN chmod +x /seed.sh
ENTRYPOINT ["/seed.sh"]
