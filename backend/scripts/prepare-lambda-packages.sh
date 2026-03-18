#!/bin/bash

set -e

echo "Preparing backend Lambda runtime assets..."

DIST_DIR="./dist"

if [ ! -d "$DIST_DIR" ]; then
    echo "dist directory does not exist. Run npm run build in /backend first."
    exit 1
fi

rm -rf "$DIST_DIR/node_modules"
cp ./package.json "$DIST_DIR/package.json"

pushd "$DIST_DIR" > /dev/null
npm install --omit=dev
popd > /dev/null

echo "Backend Lambda runtime assets prepared successfully in $DIST_DIR"
