#!/bin/bash
# Build script for Render deployment

echo "Installing dependencies..."
npm ci

echo "Building frontend..."
npm run build

echo "Build completed successfully!"
