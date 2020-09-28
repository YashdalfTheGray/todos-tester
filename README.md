# todos-tester

Test package for the [todos app](https://github.com/YashdalfTheGray/todos) using Puppeteer, Jest, Javascript and Docker.

## Setup

This project relies on Docker but can also be run outside of Docker. You will need Docker 1.13.0 CE and/or a Node.js 8.6 or newer and npm v5.6 or newer to run this project. By default, the Docker version of this package will run on the latest Node.js version based on Alpine Linux.

The first thing to do is to create a file in the project directory called `.env` and add some keys to it. The keys are listed below. The firebase keys are the same ones that you used to set up [the webapp](https://github.com/YashdalfTheGray/todos) that this tester goes with.

The `DEBUG` variable has 3 possible values, `none` which runs silently, `screenshot` which will take screenshots at the end of each test and `interactive` which will take screenshots and run puppeteer in non-headless mode. The interactive mode doesn't work under Docker so it will be ignored. The default value for `DEBUG` is `none`.

**NOTE** - If you don't include the `TEST_URL` environment variable, Jest may fail with a cryptic error.

```
TEST_URL=<server_url>
DEBUG=<none|screenshot|interactive>
FIREBASE_API_KEY=<api_key>
FIREBASE_PROJECT_ID=<project_id>
FIREBASE_MESSAGING_ID=<messaging_id>
```

Once you have this created, you can either run `npm install` to install all the dependencies or run `docker build -t todos-tester .` to build the image.

## Running

There are two paths to run this project, using npm or using Docker. Running using npm is as simple as running `npm test` after setting up the project. This will run all the tests in the package using the test URL specified above and the debug strategy given.

Running using Docker is even easier once the image is built. Running `docker run --init -it --name <some_name> --env-file .env todos-tester` will run the whole set of tests in a Docker container.

## Results

Unless the debug strategy above is set to `none`, this project will take screenshots at the end of every test. These screenshots are localed in `./artifacts` while running locally and are named appropriately for each test.

While running under Docker, you can't run in `interactive` mode but you can still specify that the tests take screenshots. The screenshots are located in the Docker container and you can use the `docker diff` and the `docker cp` command.

First, check if the tests ran successfully by running `docker inspect --format='{{.State.ExitCode}}' <name_set_in_run_command>`. This should return `0` if the tests were successful.

Then you can run `docker diff <name_set_in_run_command>`. This command will compare the current filesystem of the container to the initial filesystem. You can also use `docker cp <name_set_in_run_command>:/usr/app/artifacts <path_on_host>` to copy the whole folder from the container to the local filesystem so that you can look at the screenshots.

## Resources

-   [Puppeteer Docs](https://pptr.dev/)
-   [Jest API](https://facebook.github.io/jest/docs/en/getting-started.html)
-   [Expect API](https://facebook.github.io/jest/docs/en/expect.html)
-   [Faker Docs](https://github.com/marak/Faker.js/)
-   [`docker run` options](https://docs.docker.com/engine/reference/commandline/run/)
-   [Difference between Chromium and Chrome](https://www.howtogeek.com/202825/what%E2%80%99s-the-difference-between-chromium-and-chrome/)
-   [Interesting issue with Jest's `testEnvironment` and Firebase](https://github.com/firebase/firebase-js-sdk/issues/3096)
