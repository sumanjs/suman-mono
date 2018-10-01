#!/usr/bin/env bash

which_suman="$(which suman)";

if [[ -z "${which_suman}" ]]; then
    npm install -g suman
fi

suman test/**/*.js