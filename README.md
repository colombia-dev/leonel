# node-slack-bot
A super simple node.js slack bot

Clone the repo and `npm install`

Running locally:

    SLACK_TOKEN=<YOUR_SLACK_TOKEN> npm start

Building with Docker:

    docker build -t beepboophq/node-slack-bot .

Running

    docker run -it --rm -e SLACK_TOKEN=<YOUR_SLACK_TOKEN> beepboophq/node-slack-bot
