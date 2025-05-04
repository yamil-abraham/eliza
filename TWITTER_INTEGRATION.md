# Twitter Integration for elizaOS

This document provides instructions for setting up the Twitter integration with elizaOS. This integration allows you to monitor Twitter accounts and automatically retweet content based on keywords.

## Setup Instructions

These instructions work on any platform (macOS, Linux, Windows with WSL).

   ### Prerequisites

   - Node.js installed
   - elizaOS repository cloned and set up
   - Twitter account credentials

   ### Installation Steps

1. Navigate to the Twitter listener directory:
   ```bash
   cd scripts/twitter-listener
   ```
2. Edit the credentials in the start script:
   ```bash
   # Open with your preferred editor
   code start-twitter-listener.sh
   ```
   ```bash
   # Update these values with your Twitter credentials
   export TWITTER_USERNAME="your_twitter_username"
   export TWITTER_PASSWORD='your_twitter_password'  # Use single quotes for passwords with special characters
   export TWITTER_EMAIL="your_twitter_email"
   export TWITTER_TARGET_ACCOUNT="account_to_monitor"
   export TWITTER_CHECK_INTERVAL="60000"
   export TWITTER_RETWEET_KEYWORDS="keyword1,keyword2,keyword3"
   ```

3. Make the scripts executable (Linux/macOS only):
   ```bash
   chmod +x twitter-listener.js
   ```
   ```bash
   chmod +x start-twitter-listener.sh
   ```

4. Run the Twitter listener:
   ```bash
   # On Linux/macOS
   ./start-twitter-listener.sh
   ```
   ```bash
   # On Windows
   bash start-twitter-listener.sh
   ```

## Configuration Options
- TWITTER_USERNAME: Your Twitter username
- TWITTER_PASSWORD: Your Twitter password
- TWITTER_EMAIL: Your Twitter email (for 2FA if needed)
- TWITTER_TARGET_ACCOUNT: The Twitter account to monitor (without @)
- TWITTER_CHECK_INTERVAL: How often to check for new tweets (in milliseconds)
- TWITTER_RETWEET_KEYWORDS: Comma-separated keywords to filter retweets
- TWITTER_LOG_FILE: Path to the log file (default: ./twitter-listener.log)

## Running in Background
To run the listener in the background:
   ```bash
      # On Linux/macOS
      nohup ./start-twitter-listener.sh > twitter-output.log 2>&1 &
   ```
   ```bash

      # On Windows (using Git Bash or similar)
      nohup bash start-twitter-listener.sh > twitter-output.log 2>&1 &
   ```
## Troubleshooting
### Login Issues
If you encounter login issues:

1. Make sure your username and password are correct
2. If your account has 2FA, make sure to provide the email
3. Twitter may block automated login attempts. In this case, try again later
### Monitoring Issues
If the script is not detecting new tweets:

1. Make sure the target account exists and is public
2. Check the log file for any errors
3. Increase the check interval if Twitter is rate-limiting your requests
## How It Works
The Twitter listener script:

1. Logs into Twitter using your credentials
2. Monitors the specified Twitter account for new tweets
3. When a new tweet is detected, it checks if it contains any of your keywords
4. If the tweet matches your keywords, it automatically retweets it from your account
## Security Considerations
- The script stores your Twitter credentials in plain text in the start script
- For better security, consider using environment variables or a secure configuration file
- Never commit your credentials to a public repository