#!/bin/sh

java -jar ./closure-compiler-v20240317.jar \
  --dependency_mode=NONE \
  --js ../src/natural.core.js \
  --js ../src/natural.architecture.js \
  --js ../src/natural.data.js \
  --js ../src/natural.ui.js \
  --js ../src/natural.ui.shell.js \
  --js ../src/natural.js.js \
  --js ../src/natural.code.js \
  --js_output_file ../dist/natural.js+code.es5.min.js \
  --create_source_map ../dist/natural.js+code.es5.min.map \
  --language_in UNSTABLE \
  --language_out ECMASCRIPT5