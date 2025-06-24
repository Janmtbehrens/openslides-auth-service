#!/bin/sh

if [ -n "$dev"   ]; then node node_modules/.bin/nodemon src/index.ts; fi
if [ -n "$tests" ]; then node node_modules/.bin/nodemon src/index.ts; fi
if [ -n "$prod"  ]; then node index.js; fi