#!/bin/bash

# Set environment variables
# export TWITTER_USERNAME="fedesch7"
# export TWITTER_PASSWORD='23.qgf5Uq5AJ:pB'  # Using single quotes to preserve special characters
# export TWITTER_EMAIL="schwemlerfederico@gmail.com"
# export TWITTER_TARGET_ACCOUNT="cointelegraph"
# export TWITTER_CHECK_INTERVAL="60000"
# export TWITTER_RETWEET_KEYWORDS="bitcoin,ethereum,cryptocurrency"
# export TWITTER_LOG_FILE="./twitter-listener.log"

# Make the script executable
chmod +x /scripts/twitter-listener/twitter-listener.js

# Run the Twitter listener
node "/app/scripts/twitter-listener/twitter-listener.js"
