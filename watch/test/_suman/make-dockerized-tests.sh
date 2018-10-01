#!/usr/bin/env bash

# docker run -it your-dockerized-suman-tests-image /bin/bash

cd $(dirname "$0");
npm_root="$(npm root)";
project_root="$(cd ${npm_root} && cd .. && pwd)";

project_basename="$(basename ${project_root})";

image_tag="your-dockerized-suman-tests-image";
container_name="your-dockerized-suman-tests"

dockerfile_root="${project_root}/$(uuidgen)"

cp Dockerfile ${dockerfile_root}

function cleanup {
  # in case the user kills script prematurely
  rm -rf ${dockerfile_root};
}

trap cleanup EXIT

#
#docker rmi -f $(docker images --no-trunc | grep "<none>" | awk "{print \$3}")
#docker rmi -f $(docker images --no-trunc | grep "${image_tag}" | awk "{print \$3}")
#docker rmi -f ${image_tag}
#

docker stop ${container_name} > /dev/null 2>&1
docker rm ${container_name} > /dev/null 2>&1

echo "building the test with docker build...";
docker build -t ${image_tag} -f ${dockerfile_root} ${project_root}  > /dev/null

rm -rf ${dockerfile_root};

echo "arguments to suman executable: '$1'"
echo "running the test with docker run...";

#docker run -v "${project_root}/node_modules":/usr/src/app --name  ${container_name} ${image_tag}
docker run --name  ${container_name} ${image_tag} $1

