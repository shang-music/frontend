#!/usr/bin/env bash

source util.sh

function baseBuild() {
  local nodeEnv=${1:-development}

  rm -rf dist
  mkdir dist
  ng build --prod --output-path dist
  
  _generateLog
  _dockerConfig ${nodeEnv} ${projectDir}/${DockerfilePath}/${nodeEnv}
}

if [ "$1" = "prod" ]
then
  shift 1
  set -- "production $*"
fi


echo "===== build $* ====="
resetDir
baseBuild $*