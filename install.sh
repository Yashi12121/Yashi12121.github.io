#!/usr/bin/env bash
set -e

echo "YashiX Swarm Rebuild installer"
echo "Fetching latest release from https://github.com/Yashi12121/Yashi12121.github.io/releases ..."
OS="$(uname -s)"
case "${OS}" in
    Darwin*)
        echo "Detected macOS. Opening releases page..."
        open "https://github.com/Yashi12121/Yashi12121.github.io/releases"
        ;;
    Linux*)
        echo "Detected Linux. Opening releases page..."
        if command -v xdg-open > /dev/null; then
            xdg-open "https://github.com/Yashi12121/Yashi12121.github.io/releases"
        else
            echo "Please download the Linux release from https://github.com/Yashi12121/Yashi12121.github.io/releases"
        fi
        ;;
    *)
        echo "Unsupported OS: ${OS}. Please visit https://github.com/Yashi12121/Yashi12121.github.io/releases"
        ;;
esac
