/**
 * This script demonstrates how to send a notification when a task completes successfully.
 * You can use this as a template for real-world scenarios like CI/CD pipelines,
 * cron jobs, or any automated process where you want to receive notifications.
 * 
 * Usage: node notify-success.js <platform> <webhook_url> "<message>" "<title>"
 * 
 * Where:
 * - platform: "feishu", "dingtalk", "wechatwork", or "auto" (for automatic detection)
 * - webhook_url: The webhook URL for the platform
 * - message: The message content (put in quotes if it contains spaces)
 * - title: (Optional) Message title (put in quotes if it contains spaces)
 * 
 * Example:
 * node notify-success.js feishu "https://open.feishu.cn/open-apis/bot/v2/hook/xxx" "Deployment successful!" "Deployment Status"
 */

const axios = require('axios');
require('dotenv').config();

async function notifySuccess() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: node notify-success.js <platform> <webhook_url> "<message>" "<title>"');
    process.exit(1);
  }
  
  const platform = args[0].toLowerCase();
  const webhook = args[1];
  const message = args[2];
  const title = args[3] || '';
  
  try {
    let payload;
    
    // Prepare payload based on platform
    switch (platform) {
      case 'feishu':
        payload = createFeishuPayload(message, title);
        break;
      case 'dingtalk':
        payload = createDingtalkPayload(message, title);
        break;
      case 'wechatwork':
        payload = createWechatworkPayload(message);
        break;
      case 'auto':
        if (webhook.includes('feishu.cn') || webhook.includes('lark.suite')) {
          payload = createFeishuPayload(message, title);
        } else if (webhook.includes('dingtalk.com')) {
          payload = createDingtalkPayload(message, title);
        } else if (webhook.includes('qyapi.weixin.qq.com')) {
          payload = createWechatworkPayload(message);
        } else {
          console.error('Could not automatically detect platform from webhook URL');
          process.exit(1);
        }
        break;
      default:
        console.error(`Unknown platform: ${platform}`);
        process.exit(1);
    }
    
    // Send the notification
    const response = await axios.post(webhook, payload);
    console.log('Notification sent successfully!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error sending notification:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

function createFeishuPayload(message, title) {
  if (!title) {
    return {
      msg_type: 'text',
      content: {
        text: message
      }
    };
  }
  
  return {
    msg_type: 'interactive',
    card: {
      config: {
        wide_screen_mode: true
      },
      elements: [
        {
          tag: 'div',
          text: {
            content: message,
            tag: 'lark_md'
          }
        }
      ],
      header: {
        template: 'green',
        title: {
          content: title,
          tag: 'plain_text'
        }
      }
    }
  };
}

function createDingtalkPayload(message, title) {
  if (!title) {
    return {
      msgtype: 'text',
      text: {
        content: message
      }
    };
  }
  
  return {
    msgtype: 'markdown',
    markdown: {
      title: title,
      text: `### ${title}\n${message}`
    }
  };
}

function createWechatworkPayload(message) {
  return {
    msgtype: 'text',
    text: {
      content: message
    }
  };
}

notifySuccess();
