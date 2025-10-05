FROM cr.selcloud.ru/registry-12/base-perl:latest

RUN cpanm -n Perl::Tidy Perl::LanguageServer Digest::SHA Module::Signature

RUN useradd -ms /bin/zsh vscode
USER vscode
WORKDIR /workspaces/back/

ADD cpanfile* .
RUN carmel install
