CLI=../packages/expo-material-symbols/bin/add-icon.mjs
OUT=./assets

# Multiple icons at once
node $CLI search star home -o $OUT

# Rounded style
node $CLI -s rounded search star -o $OUT

# Sharp + filled
node $CLI -s sharp --fill favorite -o $OUT

# Custom weight
node $CLI -w 100 backspace -o $OUT
node $CLI -w 700 backspace -o $OUT

# Filled + heavy weight
node $CLI --fill -w 700 backspace -o $OUT

# From a Google Fonts URL
node $CLI "https://fonts.google.com/icons?selected=Material+Symbols+Outlined:do_not_disturb_on" -o $OUT
