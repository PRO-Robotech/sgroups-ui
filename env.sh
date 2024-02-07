#!/bin/bash

rm -rf ./env-config.js
touch ./env-config.js

echo "window._env_ = {" >> ./env-config.js
echo "HBF_API: \"$HBF_API\"," >> ./env-config.js
echo "BASE_PREFIX: \"$BASE_PREFIX\"," >> ./env-config.js
echo "}" >> ./env-config.js
