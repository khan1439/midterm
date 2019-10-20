# Set the base image to Ubuntu
FROM    ubuntu:trusty

# File Author / Maintainer
LABEL maintainer="Jason Baker"

# Install Node.js and other dependencies
RUN apt-get update && \
    apt-get -y install curl && \
    curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - && \
    apt-get install -y nodejs

# Install nodemon
RUN npm install -g nodemon

# Provides cached layer for node_modules
ADD nodejs/package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /src && cp -a /tmp/node_modules /src/

# Define working directory
WORKDIR /src
ADD nodejs /src

# Expose port
EXPOSE  8080

# Run app using nodemon
CMD ["nodemon", "/src/index.js"]
