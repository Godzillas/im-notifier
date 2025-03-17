/**
 * This file demonstrates how to test the IM Notifier MCP server locally
 * without needing to integrate with Claude.
 * 
 * Run this with: node test_send.js
 */

const axios = require('axios');

// This assumes you're running the MCP server with HTTP transport
// Make sure to set USE_HTTP=true and HTTP_PORT=3000 in your .env file
async function testSendMessage() {
  try {
    // Example for sending a message to Feishu
    const feishuResponse = await axios.post('http://localhost:3000/rpc', {
      jsonrpc: '2.0',
      id: '1',
      method: 'tool',
      params: {
        name: 'feishu_send',
        parameters: {
          webhook: 'YOUR_FEISHU_WEBHOOK_URL',
          message: 'Hello from MCP server!',
          title: 'Test Message'
        }
      }
    });
    console.log('Feishu Response:', feishuResponse.data);

    // Example for sending a message to DingTalk
    const dingtalkResponse = await axios.post('http://localhost:3000/rpc', {
      jsonrpc: '2.0',
      id: '2',
      method: 'tool',
      params: {
        name: 'dingtalk_send',
        parameters: {
          webhook: 'YOUR_DINGTALK_WEBHOOK_URL',
          message: 'Hello from MCP server!',
          title: 'Test Message',
          atMobiles: ['13800138000'],
          isAtAll: false
        }
      }
    });
    console.log('DingTalk Response:', dingtalkResponse.data);

    // Example for sending a message to WeChat Work
    const wechatworkResponse = await axios.post('http://localhost:3000/rpc', {
      jsonrpc: '2.0',
      id: '3',
      method: 'tool',
      params: {
        name: 'wechatwork_send',
        parameters: {
          webhook: 'YOUR_WECHATWORK_WEBHOOK_URL',
          message: 'Hello from MCP server!',
          mentionedList: ['user1', 'user2']
        }
      }
    });
    console.log('WeChat Work Response:', wechatworkResponse.data);

    // Example for using the universal send_message tool
    const universalResponse = await axios.post('http://localhost:3000/rpc', {
      jsonrpc: '2.0',
      id: '4',
      method: 'tool',
      params: {
        name: 'send_message',
        parameters: {
          webhook: 'YOUR_PLATFORM_WEBHOOK_URL', // The server will detect which platform this is
          message: 'Hello from MCP server!',
          title: 'Test Message',
          atUsers: ['user1', '13800138000'],
          isAtAll: false
        }
      }
    });
    console.log('Universal Send Response:', universalResponse.data);

  } catch (error) {
    console.error('Error testing MCP server:', error.response?.data || error.message);
  }
}

testSendMessage();
