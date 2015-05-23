#!/bin/sh
for i in `find src -name "*.js"`;
    do
        echo $i
        ../bin/jformatter.js $i > tempjs
        cp tempjs $i
    done
rm tempjs
