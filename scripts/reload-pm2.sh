#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

REPOSITORY=/var/www/html/21market-be-v3

echo $HOME
echo $DEPLOYMENT_GROUP_NAME

cd $REPOSITORY

npm run start:$DEPLOYMENT_GROUP_NAME