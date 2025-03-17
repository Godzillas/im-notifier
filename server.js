const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const axios = require("axios");
require("dotenv").config();

// Get default webhook URLs from environment variables
const DEFAULT_FEISHU_WEBHOOK = process.env.FEISHU_WEBHOOK_URL || "";
const DEFAULT_DINGTALK_WEBHOOK = process.env.DINGTALK_WEBHOOK_URL || "";
const DEFAULT_WECHATWORK_WEBHOOK = process.env.WECHAT_WEBHOOK_URL || "";
const DEFAULT_PLATFORM = process.env.DEFAULT_PLATFORM || "feishu";

// Create an MCP server
const server = new McpServer({
  name: "IM Notifier",
  version: "1.0.0",
  description: "MCP server for sending messages to Feishu, DingTalk, and WeChat Work"
});

// Feishu message tool
server.tool(
  "feishu_send",
  {
    webhook: z.string().describe("Feishu webhook URL"),
    message: z.string().describe("Message content to send"),
    title: z.string().optional().describe("Optional message title")
  },
  async ({ webhook, message, title }) => {
    try {
      // Use default webhook if not provided
      const webhookUrl = webhook || DEFAULT_FEISHU_WEBHOOK;
      
      if (!webhookUrl) {
        return {
          content: [
            {
              type: "text",
              text: "Error: No Feishu webhook URL provided. Please provide a webhook URL or set the FEISHU_WEBHOOK_URL environment variable."
            }
          ]
        };
      }
      
      // Prepare Feishu message payload
      const payload = {
        msg_type: "text",
        content: {
          text: message
        }
      };

      // If title is provided, use interactive card format
      if (title) {
        payload.msg_type = "interactive";
        payload.card = {
          config: {
            wide_screen_mode: true
          },
          elements: [
            {
              tag: "div",
              text: {
                content: message,
                tag: "lark_md"
              }
            }
          ],
          header: {
            template: "blue",
            title: {
              content: title,
              tag: "plain_text"
            }
          }
        };
      }

      // Send request to Feishu webhook
      const response = await axios.post(webhookUrl, payload);
      
      return {
        content: [
          {
            type: "text",
            text: `Message sent to Feishu successfully. Response: ${JSON.stringify(response.data)}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error sending Feishu message: ${error.message}`
          }
        ]
      };
    }
  }
);

// DingTalk message tool
server.tool(
  "dingtalk_send",
  {
    webhook: z.string().describe("DingTalk webhook URL"),
    message: z.string().describe("Message content to send"),
    title: z.string().optional().describe("Optional message title"),
    atMobiles: z.array(z.string()).optional().describe("Array of phone numbers to @ mention"),
    isAtAll: z.boolean().optional().describe("Whether to @ all members")
  },
  async ({ webhook, message, title, atMobiles = [], isAtAll = false }) => {
    try {
      // Use default webhook if not provided
      const webhookUrl = webhook || DEFAULT_DINGTALK_WEBHOOK;
      
      if (!webhookUrl) {
        return {
          content: [
            {
              type: "text",
              text: "Error: No DingTalk webhook URL provided. Please provide a webhook URL or set the DINGTALK_WEBHOOK_URL environment variable."
            }
          ]
        };
      }
      
      // Prepare DingTalk message payload
      const payload = {
        msgtype: "text",
        text: {
          content: message
        },
        at: {
          atMobiles: atMobiles,
          isAtAll: isAtAll
        }
      };

      // If title is provided, use markdown format
      if (title) {
        payload.msgtype = "markdown";
        payload.markdown = {
          title: title,
          text: message
        };
      }

      // Send request to DingTalk webhook
      const response = await axios.post(webhookUrl, payload);
      
      return {
        content: [
          {
            type: "text",
            text: `Message sent to DingTalk successfully. Response: ${JSON.stringify(response.data)}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error sending DingTalk message: ${error.message}`
          }
        ]
      };
    }
  }
);

// WeChat Work message tool
server.tool(
  "wechatwork_send",
  {
    webhook: z.string().describe("WeChat Work webhook URL"),
    message: z.string().describe("Message content to send"),
    mentionedList: z.array(z.string()).optional().describe("Array of userids to @ mention"),
    mentionedMobileList: z.array(z.string()).optional().describe("Array of phone numbers to @ mention")
  },
  async ({ webhook, message, mentionedList = [], mentionedMobileList = [] }) => {
    try {
      // Use default webhook if not provided
      const webhookUrl = webhook || DEFAULT_WECHATWORK_WEBHOOK;
      
      if (!webhookUrl) {
        return {
          content: [
            {
              type: "text",
              text: "Error: No WeChat Work webhook URL provided. Please provide a webhook URL or set the WECHAT_WEBHOOK_URL environment variable."
            }
          ]
        };
      }
      
      // Prepare WeChat Work message payload
      const payload = {
        msgtype: "text",
        text: {
          content: message,
          mentioned_list: mentionedList,
          mentioned_mobile_list: mentionedMobileList
        }
      };

      // Send request to WeChat Work webhook
      const response = await axios.post(webhookUrl, payload);
      
      return {
        content: [
          {
            type: "text",
            text: `Message sent to WeChat Work successfully. Response: ${JSON.stringify(response.data)}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error sending WeChat Work message: ${error.message}`
          }
        ]
      };
    }
  }
);

// Universal message tool that detects the platform based on the webhook URL
server.tool(
  "send_message",
  {
    webhook: z.string().describe("Webhook URL for the messaging platform"),
    message: z.string().describe("Message content to send"),
    title: z.string().optional().describe("Optional message title"),
    atUsers: z.array(z.string()).optional().describe("Array of users/phone numbers to @ mention"),
    isAtAll: z.boolean().optional().describe("Whether to @ all members")
  },
  async ({ webhook, message, title, atUsers = [], isAtAll = false }) => {
    try {
      let platform = "unknown";
      let webhookUrl = webhook;
      
      // If webhook not provided, use default platform and webhook
      if (!webhookUrl) {
        platform = DEFAULT_PLATFORM;
        
        switch (platform) {
          case "feishu":
            webhookUrl = DEFAULT_FEISHU_WEBHOOK;
            break;
          case "dingtalk":
            webhookUrl = DEFAULT_DINGTALK_WEBHOOK;
            break;
          case "wechatwork":
            webhookUrl = DEFAULT_WECHATWORK_WEBHOOK;
            break;
        }
        
        if (!webhookUrl) {
          return {
            content: [
              {
                type: "text",
                text: `Error: No webhook URL provided for the default platform (${platform}). Please provide a webhook URL or set the appropriate environment variable.`
              }
            ]
          };
        }
      } else {
        // Detect platform based on webhook URL
        if (webhookUrl.includes("feishu.cn") || webhookUrl.includes("lark.suite")) {
          platform = "feishu";
        } else if (webhookUrl.includes("dingtalk.com")) {
          platform = "dingtalk";
        } else if (webhookUrl.includes("qyapi.weixin.qq.com")) {
          platform = "wechatwork";
        }
      }
      
      let response;
      
      // Send message based on detected platform
      switch (platform) {
        case "feishu":
          const feishuPayload = {
            msg_type: title ? "interactive" : "text",
            ...(title ? {
              card: {
                config: {
                  wide_screen_mode: true
                },
                elements: [
                  {
                    tag: "div",
                    text: {
                      content: message,
                      tag: "lark_md"
                    }
                  }
                ],
                header: {
                  template: "blue",
                  title: {
                    content: title,
                    tag: "plain_text"
                  }
                }
              }
            } : {
              content: {
                text: message
              }
            })
          };
          response = await axios.post(webhookUrl, feishuPayload);
          break;
          
        case "dingtalk":
          const dingtalkPayload = {
            msgtype: title ? "markdown" : "text",
            ...(title ? {
              markdown: {
                title: title,
                text: message
              }
            } : {
              text: {
                content: message
              }
            }),
            at: {
              atMobiles: atUsers,
              isAtAll: isAtAll
            }
          };
          response = await axios.post(webhookUrl, dingtalkPayload);
          break;
          
        case "wechatwork":
          const wechatworkPayload = {
            msgtype: "text",
            text: {
              content: message,
              mentioned_list: atUsers,
              mentioned_mobile_list: []
            }
          };
          response = await axios.post(webhookUrl, wechatworkPayload);
          break;
          
        default:
          return {
            content: [
              {
                type: "text",
                text: `Unknown platform for webhook URL: ${webhookUrl}`
              }
            ]
          };
      }
      
      return {
        content: [
          {
            type: "text",
            text: `Message sent to ${platform} successfully. Response: ${JSON.stringify(response.data)}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error sending message: ${error.message}`
          }
        ]
      };
    }
  }
);

// Start the server using the appropriate transport
async function startServer() {
  try {
    // Use stdio transport (recommended for production with Claude)
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("MCP server started with stdio transport");
  } catch (error) {
    console.error("Failed to start MCP server:", error);
  }
}

startServer();
