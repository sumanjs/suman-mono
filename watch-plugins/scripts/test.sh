#!/usr/bin/env bash

if [[ ! -f "package.json" ]]; then
  echo "please run the test routine from the root of the project";
  exit 1;
fi

SUMAN=$(which suman);

if [[ -z ${SUMAN} ]]; then
    npm install -g suman
fi

npm link suman -f
suman "test/**/*.js"