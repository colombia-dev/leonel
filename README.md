# Leonel
[![Circle CI](https://circleci.com/gh/buritica/leonel.svg?style=svg)](https://circleci.com/gh/buritica/leonel)

## Overview
Leonel is a bot we use to make our life easier for our [colombia-dev](http://colombia-dev.org) community

## Usage

### Run locally

**note: to run locally you must expose all the environment variables set in the [example env file][env]**

```
npm install
npm start
```

Things are looking good if the console prints something like:

```
** API CALL: https://slack.com/api/rtm.start
** BOT ID:  leonel  ...attempting to connect to RTM!
** API CALL: https://slack.com/api/chat.postMessage
```

### Running Tests
**note:make sure the proper environment vars in [example env file][env] are set before running tests**
```
ava
```


## Acknowledgements

This code uses the [botkit](https://github.com/howdyai/botkit) npm module by the fine folks at Howdy.ai.

## License

See the [LICENSE](LICENSE.md) file (MIT).

[env]: .envrc.example
