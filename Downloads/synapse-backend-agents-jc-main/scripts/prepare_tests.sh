#!/bin/bash

# Simple script to install dev dependencies so pytest can run without errors
set -e

if [ -f "pyproject.toml" ] && command -v poetry >/dev/null 2>&1; then
  echo "Installing dependencies with Poetry..."
  poetry install
else
  echo "Installing dependencies from requirements.txt..."
  pip install -r requirements.txt
fi

echo "Environment ready. Run pytest when installation finishes."
