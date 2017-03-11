# Leonel
[![Circle CI](https://circleci.com/gh/colombia-dev/leonel.svg?style=svg)](https://circleci.com/gh/buritica/leonel)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## Overview
Leonel is a bot we use to make our life easier for our [colombia-dev](http://colombia-dev.org) community

## Running locally for development

### The easy way

#### Setup your environment

- [install Docker][docker]

Make a bot integration, or have a bot token handy
- https://my.slack.com/services/new/bot

Create a `slack.env` file:

```bash
$ cp slack.env.example slack.env
```

The only token that needs to be valid is `SLACK_TOKEN`, the rest can be placeholder unless you want to test the invitation or onboarding flows.

After setting the right `SLACK_TOKEN` in your `slack.env` file, use `docker-compose` to bring up leonel:

```bash
$ docker-compose up
```

Go to your Slack, and send a DM to leonel saying `coqueto`. He'll respond if he's up. You can run docker in a [detached state][detached] by using `docker-compose up -d` instead.

#### Make changes

The docker-compose setup is configured to reboot the bot when any local file changes, using `nodemon` to make development easier.


#### Seed users

Leonel uses MongoDB to store specific information about users, you can create the user accounts by running:

```bash
$ docker-compose run bot yarn db:seed
```

This will execute the script [db:seed][db-seed] in a container to create all the users from Slack's API.

#### Running Tests

You can run `ava` tests in a container, by running:

```bash
$ docker-compose run bot yarn test
```

If you want for tests to watch your files, you can run:

```bash
$ docker-compose run bot yarn test -- -w
```

If you want to modify the `DEBUG` env var, you can run:

```bash
$ docker-compose run -e DEBUG="" bot yarn test -- -w
```

#### Shutting Down

When you're done, you can use docker-compose to clean up your environment:

```bash
$ docker-compose down
```

### The not so easy way

#### Setup your environment

All environment variables in [example env file][env] should be set before running Leonel.

Other requirements:
- Yarn
- NodeJS 7.7.x
- MongoDB

Install dependencies:

```bash
$ yarn
```

Start leonel:

```bash
$ yarn start
```

Things are looking good if the console prints something like:

```bash
** API CALL: https://slack.com/api/rtm.start
** BOT ID:  leonel  ...attempting to connect to RTM!
** API CALL: https://slack.com/api/chat.postMessage
bot:main Estamos coneptados al Eslá
```

We have added `yarn start:watch` script which uses Nodemon for convenience during development. This restarts the bot after any change done to source files.

#### Seed users

Leonel uses MongoDB to store specific information about users, you can create the user accounts by running:

```bash
$ yarn db:seed
```

This will execute the script [db:seed][db-seed] to create all the users from Slack's API.

#### Running Tests
**note: make sure the proper environment vars in [example env file][env] are set before running tests**

We use ava for unit and integration testing, you can run tests by typing:

```bash
$ yarn test
```

You can watch files and run tests when any changes are detected by using:

```bash
$ yarn test -- -w
```

### JavaScript Style

In order to minimize code style differences, we have adopted the [StandardJS][standard] style. Please make sure your changes are compatible with the guide.

**note: you can check compatibility by running tests**

```bash
$ yarn test
```

**note: you may also be able to automatically fix any style issues with the `standard` tool**

```bash
$ node_modules/.bin/standard --fix
```

Please see the documentation at [StandardJS][standard] for more information.

## Acknowledgements

This code uses the [botkit](https://github.com/howdyai/botkit) npm module by the fine folks at Howdy.ai.

## License

See the [LICENSE](LICENSE.md) file (MIT).

[env]: .envrc.example
[standard]: http://standardjs.com
[docker]: https://docs.docker.com/engine/getstarted/step_one/
[detached]: http://stackoverflow.com/questions/34029680/docker-detached-mode
[db-seed]: scripts/seed.js
