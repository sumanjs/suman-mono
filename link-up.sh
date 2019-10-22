#!/usr/bin/env bash

nlu run \
  -c .nlu.umbrella.json \
   --umbrella \
   --allow-missing
#   --append-search-root="../../oresoftware"