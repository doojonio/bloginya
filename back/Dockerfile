FROM perl:5.40

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        cpanminus \
        postgresql-server-dev-all \
        pkg-config \
        libperl-dev \
        libimage-magick-perl \
        libwebp-dev \


RUN cpanm -n Carmel

# USER vscode
WORKDIR /app
ADD cpanfile* .
RUN carmel install && carmel rollout

COPY . .

EXPOSE 8080

ENTRYPOINT ["carmel", "exec", "hypnotoad", "-f", "script/bloginya"]
