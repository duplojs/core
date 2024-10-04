#!/bin/bash

tsc -p test/overridesTypes/currentRequestObject/tsconfig.json
if [ $? -eq 2 ]; then
  exit 2
fi

tsc -p test/overridesTypes/environment/tsconfig.json
if [ $? -eq 2 ]; then
  exit 2
fi

tsc -p test/overridesTypes/extractKey/tsconfig.json
if [ $? -eq 2 ]; then
  exit 2
fi

tsc -p test/overridesTypes/httpMethod/tsconfig.json
if [ $? -eq 2 ]; then
  exit 2
fi

tsc -p test/overridesTypes/localRequest/tsconfig.json
if [ $? -eq 2 ]; then
  exit 2
fi
