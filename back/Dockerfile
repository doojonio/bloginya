FROM cr.selcloud.ru/registry-12/base-perl:latest

# USER vscode
WORKDIR /app
ADD cpanfile* ./
RUN carmel install && carmel rollout

COPY . .

EXPOSE 8080

ENTRYPOINT ["carmel", "exec", "hypnotoad", "-f", "script/bloginya"]
