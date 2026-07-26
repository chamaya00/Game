#!/usr/bin/env bash
# Copies the single shared content source (/content) into the Xcode app
# bundle's resources folder. Run this before building in Xcode, or wire it
# in as a "Run Script" build phase so it happens automatically on every build.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

mkdir -p "$REPO_ROOT/ios/Matched/Resources"
cp "$REPO_ROOT/content/roles.json" "$REPO_ROOT/ios/Matched/Resources/roles.json"
cp "$REPO_ROOT/content/design-tokens.json" "$REPO_ROOT/ios/Matched/Resources/design-tokens.json"

echo "Synced content/*.json into ios/Matched/Resources/"
