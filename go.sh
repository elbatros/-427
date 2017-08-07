#!/usr/bin/env bash

set -eu
nodeVer=$(node --version)
if [ "$nodeVer" \< "v8" ]; then
    echo "requires at least nodejs v8. current version $nodeVer"
    exit 1;
fi
dir=$(dirname $0)
cmd="$dir/src/index.js $dir/input/products.txt $dir/input/listings.txt $dir/results.txt"
echo "calling: $cmd"
eval $cmd

set +eu