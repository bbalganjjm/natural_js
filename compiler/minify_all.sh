#!/bin/sh

java -jar ./closure-compiler-v20231112.jar --js ../src/natural.core.js ../src/natural.architecture.js ../src/natural.data.js ../src/natural.ui.js ../src/natural.ui.shell.js --js_output_file ../dist/natural.js.min.js --create_source_map ../dist/natural.js.min.map