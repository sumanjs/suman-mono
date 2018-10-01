#!/usr/bin/env bash

which_tjs="$(which typescript-json-schema)";

if [[ -z "${which_tjs}" ]]; then
    npm install -g typescript-json-schema
fi

typescript-json-schema --ignoreErrors tsconfig.json IAtConfig > schemas/values/@config.json
