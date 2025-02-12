#!/bin/bash

tsc -p test/overridesTypes/currentRequestObject/tsconfig.json & pid1=$! &
tsc -p test/overridesTypes/environment/tsconfig.json & pid2=$! &
tsc -p test/overridesTypes/extractKey/tsconfig.json & pid3=$! &
tsc -p test/overridesTypes/httpMethod/tsconfig.json & pid4=$! &
tsc -p test/overridesTypes/injectFloor/tsconfig.json & pid5=$! &
tsc -p test/overridesTypes/localRequest/tsconfig.json & pid6=$! &

wait $pid1 || exit 1
wait $pid2 || exit 1
wait $pid3 || exit 1
wait $pid4 || exit 1
wait $pid5 || exit 1
wait $pid6 || exit 1
