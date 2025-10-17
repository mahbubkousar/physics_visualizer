/**
 * Gemini API Integration
 *
 * Handles communication with Google's Gemini API
 */
export class GeminiChat {
  constructor(apiKey, systemPrompt) {
    this.apiKey = apiKey;
    this.systemPrompt = systemPrompt;
    this.conversationHistory = [];

    // Using v1beta API for better model availability
    // gemini-1.5-flash-latest is recommended for production
    this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    // Rate limiting: Track request timestamps
    // Free tier: 15 RPM (requests per minute), Paid tier: varies
    // Being conservative with client-side limits
    this.requestTimestamps = [];
    this.maxRequestsPerMinute = 15; // Conservative limit
    this.minRequestInterval = 2000; // Minimum 2 seconds between requests
    this.lastRequestTime = 0;

    // Retry configuration for handling 429 errors
    this.maxRetries = 3;
    this.baseRetryDelay = 5000; // Start with 5 seconds
  }

  /**
   * Add a message to conversation history
   */
  addToHistory(role, content) {
    this.conversationHistory.push({
      role,
      parts: [{ text: content }]
    });
  }

  /**
   * Check if we can make a request without hitting rate limits
   */
  canMakeRequest() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove timestamps older than 1 minute
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneMinuteAgo);

    // Check if we've hit the per-minute limit
    if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
      return { allowed: false, reason: 'rate_limit', waitTime: 60000 };
    }

    // Check minimum interval between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      return {
        allowed: false,
        reason: 'too_fast',
        waitTime: this.minRequestInterval - timeSinceLastRequest
      };
    }

    return { allowed: true };
  }

  /**
   * Wait before making request to respect rate limits
   */
  async waitForRateLimit() {
    const check = this.canMakeRequest();
    if (!check.allowed) {
      const waitSeconds = Math.ceil(check.waitTime / 1000);
      console.log(`GeminiAPI: Rate limit - waiting ${waitSeconds} seconds...`);
      await new Promise(resolve => setTimeout(resolve, check.waitTime));
    }
  }

  /**
   * Make API request with retry logic
   */
  async makeRequest(retryCount = 0) {
    try {
      console.log('GeminiAPI: Calling endpoint:', this.apiEndpoint);

      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            // System prompt as first message
            {
              role: 'user',
              parts: [{ text: this.systemPrompt }]
            },
            {
              role: 'model',
              parts: [{ text: 'Understood! I will act as a physics tutor and use the visualization tools when appropriate by including JSON blocks in my responses.' }]
            },
            // Conversation history
            ...this.conversationHistory
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          }
        })
      });

      console.log('GeminiAPI: Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('GeminiAPI: Error response:', errorData);

        // Handle 429 rate limit with exponential backoff
        if (response.status === 429) {
          if (retryCount < this.maxRetries) {
            const retryDelay = this.baseRetryDelay * Math.pow(2, retryCount);
            const waitSeconds = Math.ceil(retryDelay / 1000);
            console.log(`GeminiAPI: Rate limited (429). Retry ${retryCount + 1}/${this.maxRetries} in ${waitSeconds} seconds...`);

            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return this.makeRequest(retryCount + 1);
          } else {
            throw new Error('Rate limit exceeded. Please wait a minute and try again. If you have billing enabled, check your quota at https://console.cloud.google.com/');
          }
        }

        // Handle quota/billing errors
        if (errorData.error?.message?.includes('quota') || errorData.error?.message?.includes('billing')) {
          throw new Error(`API Error: ${errorData.error.message}\n\nPlease check:\n1. Billing is enabled at https://console.cloud.google.com/billing\n2. API quota at https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas\n3. Get a new API key at https://aistudio.google.com/app/apikey`);
        }

        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('GeminiAPI: Success, got data');

      return data;
    } catch (error) {
      // If it's a network error and we haven't exceeded retries, try again
      if (retryCount < this.maxRetries && !error.message.includes('API Error')) {
        const retryDelay = this.baseRetryDelay * Math.pow(2, retryCount);
        const waitSeconds = Math.ceil(retryDelay / 1000);
        console.log(`GeminiAPI: Request failed. Retry ${retryCount + 1}/${this.maxRetries} in ${waitSeconds} seconds...`);

        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.makeRequest(retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Send a message to Gemini and get response
   */
  async sendMessage(userMessage) {
    // Add user message to history
    this.addToHistory('user', userMessage);

    // Wait if necessary to respect rate limits
    await this.waitForRateLimit();

    // Track this request
    const now = Date.now();
    this.requestTimestamps.push(now);
    this.lastRequestTime = now;

    try {
      const data = await this.makeRequest();
      console.log('GeminiAPI: Full response data:', JSON.stringify(data, null, 2));

      // Check if response has expected structure
      if (!data.candidates || !data.candidates[0]) {
        console.error('GeminiAPI: Unexpected response structure:', data);
        throw new Error('Invalid API response: No candidates found. Response may have been blocked or filtered.');
      }

      const candidate = data.candidates[0];

      // Check finish reason
      if (candidate.finishReason === 'MAX_TOKENS') {
        console.warn('GeminiAPI: Response was cut off due to MAX_TOKENS');
      }

      if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
        console.error('GeminiAPI: Missing content in response:', candidate);

        // Check if there's a safety or other blocking reason
        if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
          throw new Error(`Response blocked due to: ${candidate.finishReason}`);
        }

        throw new Error(`Invalid API response: No content in candidate. Finish reason: ${candidate.finishReason || 'unknown'}`);
      }

      const assistantMessage = candidate.content.parts[0].text;

      // Add assistant response to history
      this.addToHistory('model', assistantMessage);

      return assistantMessage;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get current conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }
}