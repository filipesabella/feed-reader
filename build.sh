rm -rf docs/

./node_modules/.bin/parcel build src/main/index.html \
  --public-url '.' \
  --out-dir docs/ \
  --no-source-maps

# the build process generates quite a few woff and woff2 files for the font
# we use. this line deletes all of them but the two we use,
# barlow-latin-400.woff2 and barlow-latin-500.woff2
ls docs/*.woff* | perl -ne \
  'print if not m{(barlow-latin-400\..*woff2?|barlow-latin-500\..*.woff2?)}' \
  | xargs rm
