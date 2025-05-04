#!/bin/bash

# Set environment variables
export TWITTER_USERNAME="your_twitter_username"
export TWITTER_PASSWORD='your_twitter_password'  # Using single quotes to preserve special characters
export TWITTER_EMAIL="your_twitter_email"
export TWITTER_TARGET_ACCOUNT="account_to_monitor"
export TWITTER_CHECK_INTERVAL="60000"
export TWITTER_RETWEET_KEYWORDS="keyword1,keyword2,keyword3"
export TWITTER_LOG_FILE="./twitter-listener.log"

# Make the script executable
chmod +x twitter-listener.js

# Run the Twitter listener
node twitter-listener.js
