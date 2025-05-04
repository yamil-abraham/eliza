#!/usr/bin/env node

const { Scraper } = require('agent-twitter-client');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  username: process.env.TWITTER_USERNAME || '',
  password: process.env.TWITTER_PASSWORD || '',
  email: process.env.TWITTER_EMAIL || '',
  targetAccount: process.env.TWITTER_TARGET_ACCOUNT || '',
  checkInterval: parseInt(process.env.TWITTER_CHECK_INTERVAL || '60000', 10),
  retweetKeywords: process.env.TWITTER_RETWEET_KEYWORDS ? 
    process.env.TWITTER_RETWEET_KEYWORDS.split(',') : [],
  logFile: process.env.TWITTER_LOG_FILE || path.join(__dirname, 'twitter-listener.log')
};

// Validate configuration
if (!config.username || !config.password || !config.targetAccount) {
  console.error('Error: TWITTER_USERNAME, TWITTER_PASSWORD, and TWITTER_TARGET_ACCOUNT environment variables are required');
  process.exit(1);
}

// Setup logging
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  // Also log to file
  fs.appendFileSync(config.logFile, logMessage + '\n');
}

// State tracking
let lastTweetId = null;
let scraper = null;

// Initialize the scraper
async function initialize() {
  try {
    scraper = new Scraper();
    log(`Logging in as ${config.username}...`);
    
    await scraper.login(
      config.username,
      config.password,
      config.email
    );
    
    log('Twitter listener initialized successfully');
    
    // Get the latest tweet to establish a baseline
    const latestTweet = await scraper.getLatestTweet(config.targetAccount);
    if (latestTweet) {
      lastTweetId = latestTweet.id;
      log(`Baseline tweet ID: ${lastTweetId}`);
      log(`Latest tweet: "${latestTweet.text}"`);
    } else {
      log(`No tweets found for account: ${config.targetAccount}`);
    }
    
    return true;
  } catch (error) {
    log(`Failed to initialize Twitter listener: ${error.message}`);
    return false;
  }
}

// Check for new tweets
async function checkForNewTweets() {
  try {
    log(`Checking for new tweets from ${config.targetAccount}...`);
    
    const latestTweet = await scraper.getLatestTweet(config.targetAccount);
    
    if (!latestTweet) {
      log('No tweets found');
      return;
    }
    
    // If this is the first check or we have a new tweet
    if (!lastTweetId || latestTweet.id !== lastTweetId) {
      if (lastTweetId) { // Only process if not the first run
        log(`New tweet detected: "${latestTweet.text}"`);
        
        // Check if the tweet contains any of our keywords
        if (shouldRetweet(latestTweet.text)) {
          await retweet(latestTweet.id);
        } else {
          log(`Tweet does not match keywords, skipping retweet`);
        }
      }
      
      lastTweetId = latestTweet.id;
    } else {
      log('No new tweets');
    }
  } catch (error) {
    log(`Error in checkForNewTweets: ${error.message}`);
  }
}

// Check if a tweet should be retweeted based on keywords
function shouldRetweet(tweetText) {
  if (!config.retweetKeywords || config.retweetKeywords.length === 0) {
    log('No keywords specified, will retweet all tweets');
    return true; // Retweet everything if no keywords specified
  }
  
  const matches = config.retweetKeywords.filter(keyword => 
    tweetText.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (matches.length > 0) {
    log(`Tweet matches keywords: ${matches.join(', ')}`);
    return true;
  }
  
  return false;
}

// Retweet a tweet
async function retweet(tweetId) {
  try {
    log(`Retweeting tweet ${tweetId}...`);
    await scraper.retweet(tweetId);
    log(`Successfully retweeted tweet ${tweetId}`);
  } catch (error) {
    log(`Failed to retweet ${tweetId}: ${error.message}`);
  }
}

// Main function
async function main() {
  log('Starting Twitter listener...');
  log(`Target account: ${config.targetAccount}`);
  log(`Check interval: ${config.checkInterval}ms`);
  
  if (config.retweetKeywords.length > 0) {
    log(`Retweet keywords: ${config.retweetKeywords.join(', ')}`);
  } else {
    log('No retweet keywords specified, will retweet all tweets');
  }
  
  const initialized = await initialize();
  
  if (initialized) {
    // Initial check
    await checkForNewTweets();
    
    // Set up interval for checking
    setInterval(async () => {
      await checkForNewTweets();
    }, config.checkInterval);
    
    log(`Twitter listener is running. Press Ctrl+C to stop.`);
  } else {
    log('Failed to initialize Twitter listener, exiting');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('Shutting down Twitter listener...');
  process.exit(0);
});

// Start the application
main().catch(error => {
  log(`Unhandled error: ${error.message}`);
  process.exit(1);
});
