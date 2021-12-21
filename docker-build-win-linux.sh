#!/bin/bash

docker run --rm \
        --env-file <(env | grep -v '\r' | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS|APPVEYOR_|CSC_|_TOKEN|_KEY|AWS_|STRIP|BUILD_') \
        -v ${PWD}:/project \
        -v $(realpath ./.cache):/root/.cache \
        electronuserland/builder:wine \
        /bin/bash -c "yarn --link-duplicates --pure-lockfile && \
                      yarn build && yarn dist --win --linux"
