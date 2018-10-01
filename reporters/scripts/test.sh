#!/usr/bin/env bash

set -e;
which_suman=$(which suman);

if [[ -z "${which_suman}" ]]; then
    npm install -g suman;
fi

suman test/**/*.js
