FROM mcr.microsoft.com/devcontainers/base:ubuntu

RUN sudo apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && sudo apt-get -y install --no-install-recommends cpanminus postgresql-server-dev-all

RUN sudo cpanm -n Carmel Perl::Tidy

# USER vscode
WORKDIR /workspaces/saram/
ADD cpanfile* .
RUN carmel install
