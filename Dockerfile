FROM node:9.4

# Create app directory
WORKDIR /usr/src/app

# run app
CMD [ "npm", "run", "start:watch" ]
