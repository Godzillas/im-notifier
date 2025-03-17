# IM Notifier MCP Server

An MCP (Model Context Protocol) server that allows Large Language Models like Claude to send messages to popular Chinese corporate messaging platforms:

- Feishu (飞书/Lark)
- DingTalk (钉钉)
- WeChat Work (企业微信)

## Overview

This MCP server implements the Anthropic Model Context Protocol to enable AI language models to directly send notifications and messages to popular messaging platforms used in Chinese companies. It provides a standardized way for LLMs to communicate with these platforms through webhook URLs.

## Features

- Send messages to Feishu/Lark with support for both text and interactive card formats
- Send messages to DingTalk with support for text and markdown formats
- Send messages to WeChat Work with @mention functionality
- Universal send_message tool that automatically detects the platform based on the webhook URL

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/im-notifier.git
cd im-notifier

# Install dependencies
npm install
```

## Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Configure your environment variables in the `.env` file:

```
# For testing with HTTP transport
USE_HTTP=true
HTTP_PORT=3000

# Optional default webhook URLs
FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_WEBHOOK_TOKEN
DINGTALK_WEBHOOK=https://oapi.dingtalk.com/robot/send?access_token=YOUR_ACCESS_TOKEN
WECHATWORK_WEBHOOK=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY
```

## Usage with Claude

To use this MCP server with Claude, you need to configure it in your MCP client configuration.

### Claude Desktop Configuration

Add the following to your `claude_desktop_config.json` or `.codeium/windsurf/mcp_config.json` file:

```json
{
  "mcpServers": {
    "im-notifier": {
      "command": "node",
      "args": ["/path/to/im-notifier/server.js"]
    }
  }
}
```

### Testing Locally

You can test the server locally without Claude by using the HTTP transport mode:

1. Set `USE_HTTP=true` and `HTTP_PORT=3000` in your `.env` file
2. Start the server:

```bash
npm start
```

3. Create a test script to call the server directly. The format should follow the RPC protocol:

```javascript
const axios = require('axios');

async function testFeishuSend() {
  try {
    const response = await axios.post('http://localhost:3000/rpc', {
      jsonrpc: '2.0',
      id: '1',
      method: 'tool',
      params: {
        name: 'feishu_send',
        parameters: {
          webhook: 'YOUR_FEISHU_WEBHOOK_URL',
          message: 'Test message',
          title: 'Test Title'
        }
      }
    });
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testFeishuSend();
```

Make sure to update the webhook URLs in your test script with your actual webhook URLs.

## Available Tools

### 1. feishu_send

Sends a message to Feishu/Lark.

Parameters:
- `webhook`: Feishu webhook URL
- `message`: Message content to send
- `title`: (Optional) Message title (uses interactive card if provided)

### 2. dingtalk_send

Sends a message to DingTalk.

Parameters:
- `webhook`: DingTalk webhook URL
- `message`: Message content to send
- `title`: (Optional) Message title (uses markdown format if provided)
- `atMobiles`: (Optional) Array of phone numbers to @ mention
- `isAtAll`: (Optional) Whether to @ all members

### 3. wechatwork_send

Sends a message to WeChat Work.

Parameters:
- `webhook`: WeChat Work webhook URL
- `message`: Message content to send
- `mentionedList`: (Optional) Array of userids to @ mention
- `mentionedMobileList`: (Optional) Array of phone numbers to @ mention

### 4. send_message

Universal tool that detects the platform based on the webhook URL.

Parameters:
- `webhook`: Webhook URL for the messaging platform
- `message`: Message content to send
- `title`: (Optional) Message title
- `atUsers`: (Optional) Array of users/phone numbers to @ mention
- `isAtAll`: (Optional) Whether to @ all members

## Webhook URLs

### Feishu/Lark

Create a bot in a Feishu group chat or get the webhook URL from your Feishu workspace admin.
Format: `https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_WEBHOOK_TOKEN`

### DingTalk

Create a custom robot in a DingTalk group chat and get the webhook URL.
Format: `https://oapi.dingtalk.com/robot/send?access_token=YOUR_ACCESS_TOKEN`

### WeChat Work

Create a webhook robot in a WeChat Work group chat.
Format: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY`

## License

MIT

## Repository Setup

This repository uses `.gitignore` to prevent unnecessary files from being committed:

- `node_modules/` directory is excluded to keep the repository clean and reduce size
- Environment files (`.env`) are excluded for security reasons
- Log files and OS-specific files are also excluded

To set up the repository:

1. Clone the repository
2. Install dependencies with `npm install`
3. Copy `.env.example` to `.env` and configure your webhook URLs
4. Start developing!

## Recent Updates

- Removed `test_send.js` and simplified the testing process
- Added `.gitignore` to prevent `node_modules` from being pushed to the remote repository
- Enhanced environment variable support for default webhook URLs
