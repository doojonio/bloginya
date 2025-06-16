FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Deps for Perl Lang Server and for PG
RUN sudo apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && sudo apt-get -y install --no-install-recommends \
        cpanminus \
        postgresql-server-dev-all \
        pkg-config \
        libperl-dev \
        libimage-magick-perl \
        libwebp-dev


RUN sudo cpanm -n Carmel Perl::Tidy Perl::LanguageServer

# USER vscode
WORKDIR /workspaces/saram/
ADD cpanfile* .
RUN carmel install
