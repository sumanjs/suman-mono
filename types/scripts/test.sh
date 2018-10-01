#!/usr/bin/env bash

if [[ -z "$1" ]]; then
    echo "no test path(s) specified";
    exit 1;
fi

export NODE_PATH="NODE_PATH":"$(npm root -g)"
node "$@"
