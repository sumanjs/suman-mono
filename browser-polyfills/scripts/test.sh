#!/usr/bin/env bash

which_suman=$(which suman);

if [[ -z ${which_suman} ]]; then
    npm install -g github:sumanjs/suman#rebase_branch
fi

echo "not yet implemented";
exit 1;