#!/usr/bin/env bash

DIRN=$(dirname "$0")
RL=$(readlink "$0");
EXECDIR=$(dirname $(dirname "$RL"));
MYPATH="$DIRN/$EXECDIR";
X="$(cd $(dirname ${MYPATH}) && pwd)/$(basename ${MYPATH})"

echo "X => $X"
node --inspect-brk=54031 "$X/index.js"
