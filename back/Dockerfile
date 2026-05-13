FROM cr.selcloud.ru/registry-12/base-perl:latest

# USER vscode
WORKDIR /app
ADD cpanfile* ./
RUN carmel install && carmel rollout

COPY . .
RUN chmod +x entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/app/entrypoint.sh"]
CMD []
