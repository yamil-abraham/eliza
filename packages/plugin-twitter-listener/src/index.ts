import { Scraper } from 'agent-twitter-client';

// Use the correct import path for the agent runtime
import type { IAgentRuntime, Plugin } from '@elizaos/agent';

interface TwitterListenerConfig {
  username: string;
  password: string;
  email?: string;
  targetAccount: string;
  checkInterval: number; // in milliseconds
  retweetKeywords?: string[];
}

class TwitterListener {
  private scraper: Scraper;
  private config: TwitterListenerConfig;
  private runtime: IAgentRuntime;
  private interval: NodeJS.Timeout | null = null;
  private lastTweetId: string | null = null;

  constructor(runtime: IAgentRuntime, config: TwitterListenerConfig) {
    this.runtime = runtime;
    this.config = config;
    this.scraper = new Scraper();
  }

  async initialize() {
    try {
      await this.scraper.login(
        this.config.username,
        this.config.password,
        this.config.email
      );
      
      this.runtime.logger.info('Twitter listener initialized successfully');
      
      // Get the latest tweet to establish a baseline
      const latestTweet = await this.scraper.getLatestTweet(this.config.targetAccount);
      if (latestTweet) {
        this.lastTweetId = latestTweet.id;
        this.runtime.logger.info(`Baseline tweet ID: ${this.lastTweetId}`);
      }
      
      return true;
    } catch (error) {
      this.runtime.logger.error('Failed to initialize Twitter listener', error);
      return false;
    }
  }

  start() {
    if (this.interval) {
      return;
    }
    
    this.interval = setInterval(async () => {
      try {
        await this.checkForNewTweets();
      } catch (error) {
        this.runtime.logger.error('Error checking for new tweets', error);
      }
    }, this.config.checkInterval);
    
    this.runtime.logger.info(`Started monitoring tweets from ${this.config.targetAccount}`);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.runtime.logger.info('Stopped Twitter listener');
    }
  }

  async checkForNewTweets() {
    try {
      const latestTweet = await this.scraper.getLatestTweet(this.config.targetAccount);
      
      if (!latestTweet) {
        return;
      }
      
      // If this is the first check or we have a new tweet
      if (!this.lastTweetId || latestTweet.id !== this.lastTweetId) {
        if (this.lastTweetId) { // Only process if not the first run
          this.runtime.logger.info(`New tweet detected: ${latestTweet.text}`);
          
          // Check if the tweet contains any of our keywords
          if (this.shouldRetweet(latestTweet.text)) {
            await this.retweet(latestTweet.id);
          }
        }
        
        this.lastTweetId = latestTweet.id;
      }
    } catch (error) {
      this.runtime.logger.error('Error in checkForNewTweets', error);
    }
  }

  shouldRetweet(tweetText: string): boolean {
    if (!this.config.retweetKeywords || this.config.retweetKeywords.length === 0) {
      return true; // Retweet everything if no keywords specified
    }
    
    return this.config.retweetKeywords.some(keyword => 
      tweetText.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  async retweet(tweetId: string) {
    try {
      await this.scraper.retweet(tweetId);
      this.runtime.logger.info(`Successfully retweeted tweet ${tweetId}`);
    } catch (error) {
      this.runtime.logger.error(`Failed to retweet ${tweetId}`, error);
    }
  }
}

export const twitterListenerPlugin: Plugin = {
  name: 'twitter-listener',
  version: '0.1.0',
  
  async setup(runtime: IAgentRuntime) {
    const config: TwitterListenerConfig = {
      username: process.env.TWITTER_USERNAME || '',
      password: process.env.TWITTER_PASSWORD || '',
      email: process.env.TWITTER_EMAIL,
      targetAccount: process.env.TWITTER_TARGET_ACCOUNT || '',
      checkInterval: parseInt(process.env.TWITTER_CHECK_INTERVAL || '60000', 10),
      retweetKeywords: process.env.TWITTER_RETWEET_KEYWORDS ? 
        process.env.TWITTER_RETWEET_KEYWORDS.split(',') : undefined
    };
    
    if (!config.username || !config.password || !config.targetAccount) {
      runtime.logger.error('Twitter listener plugin requires TWITTER_USERNAME, TWITTER_PASSWORD, and TWITTER_TARGET_ACCOUNT environment variables');
      return;
    }
    
    const listener = new TwitterListener(runtime, config);
    const initialized = await listener.initialize();
    
    if (initialized) {
      listener.start();
      
      // Register cleanup function
      runtime.onShutdown(() => {
        listener.stop();
      });
      
      runtime.logger.info('Twitter listener plugin setup complete');
    }
  }
};

export default twitterListenerPlugin;
