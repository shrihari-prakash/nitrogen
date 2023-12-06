#!/bin/sh

# Get the directory path containing JavaScript build files
folder_path="/usr/share/nginx/html/assets"

if [ ! -d "$folder_path" ]; then
  echo "Directory not found: $folder_path"
  exit 1
fi

escaped_liquid_host=$(printf '%s\n' "$LIQUID_HOST" | sed -e 's/[\/:.\]/\\&/g')
escaped_liquid_client_id=$(printf '%s\n' "$LIQUID_CLIENT_ID" | sed -e 's/[\/:.\]/\\&/g')

for file in "$folder_path"/*.js; do
  if [ -f "$file" ]; then
    sed -i "s/__liquid_host__/$escaped_liquid_host/g" "$file"
    sed -i "s/__liquid_client_id__/$escaped_liquid_client_id/g" "$file"
    echo "Replaced in: $file"
  fi
done

echo "Environment variables injected."
