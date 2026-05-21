#!/bin/bash
set -e

if [ "$DEV_NVIM" != "1" ]; then
  # ignore if not using neovim
  exit 0
fi

# homebrew
bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo >>/home/node/.bashrc
echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv bash)"' >>/home/node/.bashrc
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv bash)"

# neovim and plugin dependencies
brew install neovim fzf fd rg

# neovim dependencies
sudo npm install -g tree-sitter-cli neovim
