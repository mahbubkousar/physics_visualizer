/**
 * Same-origin Gemini chat client.
 *
 * The browser never receives provider credentials. All Gemini requests are
 * validated and authenticated by the Netlify Function at /api/gemini/chat.
 */
export class GeminiChat {
  constructor() {
    this.apiEndpoint = '/api/gemini/chat';
    this.conversationHistory = [];
    this.requestTimestamps = [];
    this.maxRequestsPerMinute = 15;
    this.minRequestInterval = 2000;
    this.lastRequestTime = 0;
    this.maxRetries = 2;
    this.baseRetryDelay = 1500;
  }

  addToHistory(role, content) {
    this.conversationHistory.push({ role, parts: [{ text: content }] });
    // Keep the browser payload within the server's bounded history window.
    if (this.conversationHistory.length > 24) {
      this.conversationHistory = this.conversationHistory.slice(-24);
    }
  }

  canMakeRequest() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    this.requestTimestamps = this.requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);

    if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
      return { allowed: false, waitTime: 60000 };
    }

    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      return { allowed: false, waitTime: this.minRequestInterval - timeSinceLastRequest };
    }

    return { allowed: true };
  }

  async waitForRateLimit() {
    const check = this.canMakeRequest();
    if (!check.allowed) {
      await new Promise(resolve => setTimeout(resolve, check.waitTime));
    }
  }

  async makeRequest(retryCount = 0) {
    let response;
    try {
      response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: this.conversationHistory })
      });
    } catch {
      if (retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.baseRetryDelay * (2 ** retryCount)));
        return this.makeRequest(retryCount + 1);
      }
      throw new Error('Unable to reach the AI service. Please try again.');
    }

    let data = {};
    try {
      data = await response.json();
    } catch {
      // The public error remains generic if an intermediary returns non-JSON.
    }

    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      if (retryable && retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.baseRetryDelay * (2 ** retryCount)));
        return this.makeRequest(retryCount + 1);
      }
      throw new Error(typeof data.error === 'string' ? data.error : 'AI request failed. Please try again.');
    }

    if (typeof data.text !== 'string' || !data.text.trim()) {
      throw new Error('AI service returned an invalid response.');
    }

    return data.text;
  }

  async sendMessage(userMessage) {
    this.addToHistory('user', userMessage);
    await this.waitForRateLimit();

    const now = Date.now();
    this.requestTimestamps.push(now);
    this.lastRequestTime = now;

    try {
      const assistantMessage = await this.makeRequest();
      this.addToHistory('model', assistantMessage);
      return assistantMessage;
    } catch (error) {
      // Do not retain a failed turn in subsequent requests.
      if (this.conversationHistory.at(-1)?.role === 'user') {
        this.conversationHistory.pop();
      }
      throw error;
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getHistory() {
    return this.conversationHistory;
  }
}
