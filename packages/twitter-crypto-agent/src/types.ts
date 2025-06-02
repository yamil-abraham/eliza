export interface GetTwitts {
    id: string;
    text: string;
    created_at: string;
    author_id: string;
    public_metrics: {
        retweet_count: number;
        reply_count: number;
        like_count: number;
        quote_count: number;
    };
}
export interface InteractOpenAI {
    id: string;
    text: string;
    created_at: string;
    response: string;
}
