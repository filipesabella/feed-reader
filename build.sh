rm -rf docs/

./node_modules/.bin/parcel build src/main/index.html \
  --out-dir docs/ \
  --no-source-maps

# we don't use italics and no other weights other than 400 (default) and 500
rm docs/*italic*.woff
rm docs/*.woff2
rm docs/*100*
rm docs/*200*
rm docs/*300*
rm docs/*600*
rm docs/*700*
rm docs/*800*
rm docs/*900*
