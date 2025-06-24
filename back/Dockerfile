FROM perl:5.40

# Deps for Perl Lang Server and for PG
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
		ghostscript \
		libdjvulibre-dev \
		libraw1394-dev\
        cpanminus \
        curl \
        fonts-dejavu \
        git \
        gnupg \
        gsfonts \
        libfftw3-dev \
        libgif-dev \
        libgvc6 \
        libjpeg-dev \
        liblqr-1-0-dev \
        libltdl-dev \
        libopenexr-dev \
        libopenjp2-7-dev \
        libpango1.0-dev \
        libperl-dev \
        libpng-dev \
        libraw-dev \
        libtiff5-dev \
        libwebp-dev \
        libwmf-dev \
        libzstd-dev \
        pkg-config \
        postgresql-server-dev-all

RUN git clone https://github.com/ImageMagick/ImageMagick.git /opt/ImageMagick --branch 7.1.1-47 && \
	cd /opt/ImageMagick && ./configure --with-perl && make && make install && ldconfig /usr/local/lib && \
	cd / && rm -rf /opt/ImageMagick


RUN cpanm -n Carmel

# USER vscode
WORKDIR /app
ADD cpanfile* .
RUN carmel install && carmel rollout

COPY . .

EXPOSE 8080

ENTRYPOINT ["carmel", "exec", "hypnotoad", "-f", "script/bloginya"]
