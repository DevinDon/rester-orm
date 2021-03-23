#!/usr/bin/env bash
set -e

IMAGE=$1

echo "image $IMAGE will be built"

webpack --config script/webpack.prod.js

if type docker > /dev/null 2>&1; then
  cp script/Dockerfile dist/Dockerfile
  cd dist
  docker build -t $IMAGE .
else
  echo 'docker does not installed, skip build image.'
fi
