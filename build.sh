rm -rf build/

./node_modules/.bin/parcel build src/main/index.html \
  --out-dir build/ \
  --no-source-maps

# we don't use italics and no other weights other than 400 (default) and 500
rm build/*italic*.woff
rm build/*.woff2
rm build/*100*
rm build/*200*
rm build/*300*
rm build/*600*
rm build/*700*
rm build/*800*
rm build/*900*
