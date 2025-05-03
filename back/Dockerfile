FROM perl:5.40

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends postgresql-server-dev-all

RUN cpanm -n Carmel

# USER vscode
WORKDIR /app
ADD cpanfile* .
RUN carmel install && carmel rollout

COPY . .

CMD ["carmel", "exec", "hypnotoad", "-f", "script/bloginya"]
