#!/usr/bin/env bash

cd  &&   # cd to $HOME
rm -rf suman_project_test_dir &&
mkdir suman_project_test_dir  # might already exist
cd suman_project_test_dir &&
npm init -f &&
npm install -D --loglevel=warn \
--progress=false --only=production github:sumanjs/suman#dev

#echo "...Making test directory..." &&
#mkdir test &&
#echo $(ls -a) &&
#echo "....initing suman..." &&
#./node_modules/.bin/suman --init &&
#echo "....DONE initing suman..." &&
#echo $(ls -a) &&
#echo "....creating new test file..." &&
#./node_modules/.bin/suman --create test/one.test.js &&
#echo "....executing suman test runner..." &&
#./node_modules/.bin/suman &&
#echo "all done here!"
