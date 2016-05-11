# Leonel

## Overview
Leonel is a bot we use to make our life easier for our [colombia-dev](http://colombia-dev.org) community

## Usage

### Run locally

note, to run locally you must expose all the environment variables set in the [example env file](.envrc.example)

	npm install
	npm start

Things are looking good if the console prints something like:

    ** API CALL: https://slack.com/api/rtm.start
    ** BOT ID:  leonel  ...attempting to connect to RTM!
    ** API CALL: https://slack.com/api/chat.postMessage

## Acknowledgements

This code uses the [botkit](https://github.com/howdyai/botkit) npm module by the fine folks at Howdy.ai.

## License

See the [LICENSE](LICENSE.md) file (MIT).
