#!/bin/bash

# This script copies audio files to the Angular assets folder
# Usage: ./copy-audio-to-assets.sh /path/to/audio/file.mp3

# Check if a file path was provided
if [ -z "$1" ]; then
  echo "Please provide the path to an audio file"
  echo "Usage: ./copy-audio-to-assets.sh /path/to/audio/file.mp3"
  exit 1
fi

# Get the full path to the audio file
AUDIO_FILE="$1"

# Check if the file exists
if [ ! -f "$AUDIO_FILE" ]; then
  echo "Error: File not found: $AUDIO_FILE"
  exit 1
fi

# Get just the filename
FILENAME=$(basename "$AUDIO_FILE")

# Create the assets/audio directory if it doesn't exist
ASSETS_DIR="./src/assets/audio"
mkdir -p "$ASSETS_DIR"

# Copy the file to the assets directory
cp "$AUDIO_FILE" "$ASSETS_DIR/"

echo "Copied $FILENAME to $ASSETS_DIR/"
echo "You can now access this file using the URL: assets/audio/$FILENAME"
