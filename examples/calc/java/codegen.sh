#!/bin/sh

set -e

mkdir -p src/main/resources
cp -f ../*.json src/main/resources/example.json
idl2java -j src/main/resources/example.json -p example -o src/main/java
