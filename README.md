# starter-node-bot

## Overview
A simple starting point for creating a Beep Boop hostable, Node.js based Slack bot with botkit

Visit [Beep Boop](https://beepboophq.com/docs/article/overview) to get the scoop on the the Beep Boop hosting platform. The Slack API documentation can be found [here](https://api.slack.com/).

## Assumptions
* You have already signed up with [Beep Boop](https://beepboophq.com) and have a local fork of this project.
* You have sufficient rights in your Slack team to configure a bot and generate/access a Slack API token.

## Usage

### Run locally
	npm install
	SLACK_TOKEN=<YOUR_SLACK_TOKEN> npm start

Things are looking good if the console prints something like:

    ** API CALL: https://slack.com/api/rtm.start
    ** BOT ID:  witty  ...attempting to connect to RTM!
    ** API CALL: https://slack.com/api/chat.postMessage

### Run locally in Docker
	docker build -t starter-node .`
	docker run --rm -it -e SLACK_TOKEN=<YOUR SLACK API TOKEN> starter-node

### Run in BeepBoop
If you have linked your local repo with the Beep Boop service (check [here](https://beepboophq.com/0_o/my-projects)), changes pushed to the remote master branch will automatically deploy.

## Acknowledgements

This code uses the [botkit](https://github.com/howdyai/botkit) npm module by the fine folks at Howdy.ai.

## License

See the [LICENSE](LICENSE.md) file (MIT).
