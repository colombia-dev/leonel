FROM node:7.7

# Install Yarn
RUN curl -o- -L https://yarnpkg.com/install.sh | bash

# Create app directory
WORKDIR /usr/src/app

# Install packages
RUN cd /usr/src/app && yarn

CMD [ "yarn", "start:watch" ]
