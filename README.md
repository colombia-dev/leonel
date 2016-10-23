# Leonel
[![Circle CI](https://circleci.com/gh/colombia-dev/leonel.svg?style=svg)](https://circleci.com/gh/buritica/leonel)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

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

### JavaScript Style

In order to minimize code style differences, we have adopted the [StandardJS][standard] style. Please make sure your changes are compatible with the guide.

**note: you can check compatibility by running tests**

```
npm test
```

**note: you may also be able to automatically fix any style issues with the `standard` tool**

```
standard --fix
```

Please see the documentation at [StandardJS][standard] for more information.


## Acknowledgements

This code uses the [botkit](https://github.com/howdyai/botkit) npm module by the fine folks at Howdy.ai.

## License

See the [LICENSE](LICENSE.md) file (MIT).

[env]: .envrc.example
[standard]: http://standardjs.com
