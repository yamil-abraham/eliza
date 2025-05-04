ARG NODE_VER=23.3.0
ARG BASE_IMAGE=node:${NODE_VER}
FROM $BASE_IMAGE

ENV DEBIAN_FRONTEND=noninteractive

# Install pnpm globally and install necessary build tools
RUN apt-get update \
    && apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    nano \
    vim \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ARG PNPM_VER=9.15.2
RUN npm install -g pnpm@${PNPM_VER}

# Set Python 3 as the default python
RUN ln -s /usr/bin/python3 /usr/bin/python

# Configure pnpm for better compatibility with ARM64
RUN pnpm config set registry https://registry.npmjs.org/
RUN pnpm config set node-linker hoisted

ENV DEBIAN_FRONTEND=dialog
