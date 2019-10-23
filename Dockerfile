FROM node:12.10

# Create app directory
WORKDIR /usr/src/app

# run app
CMD [ "npm", "run", "start:watch" ]
