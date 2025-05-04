# Twitter Listener for elizaOS

This script monitors a Twitter account and automatically retweets new tweets that match specified keywords.

## Setup

1. Edit the `start-twitter-listener.sh` script to add your Twitter credentials:
   ```bash
   export TWITTER_USERNAME="your_twitter_username"
   export TWITTER_PASSWORD='your_twitter_password'  # Use single quotes for passwords with special characters
   export TWITTER_EMAIL="your_twitter_email"
   export TWITTER_TARGET_ACCOUNT="account_to_monitor"
   export TWITTER_CHECK_INTERVAL="60000"
   export TWITTER_RETWEET_KEYWORDS="keyword1,keyword2,keyword3"

2. Make the scripts executable:
   ```bash
   chmod +x twitter-listener.js
   ```
   ```bash
   chmod +x start-twitter-listener.sh
   ```
3. Run the Twitter listener:
   ```bash
   ./start-twitter-listener.sh
   ```
See the [Twitter Listener README](scripts/twitter-listener/README.md) for more details.
