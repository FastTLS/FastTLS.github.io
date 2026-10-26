import { defineConfig } from "vitepress";
export default defineConfig({
  "lang": "zh-CN",
  "title": "FastTLS",
  "description": "FastTLS 官方文档：配置 TLS 指纹、HTTP 参数与请求头顺序，使用 Go、Python 或 Node.js 发送请求。",
  "base": "/",
  "cleanUrls": true,
  "lastUpdated": true,
  "themeConfig": {
    "nav": [
      {
        "text": "开始使用",
        "link": "/guide/"
      },
      {
        "text": "Go",
        "link": "/fastls/"
      },
      {
        "text": "Python",
        "link": "/python/"
      },
      {
        "text": "Node.js",
        "link": "/node/"
      },
      {
        "text": "GitHub",
        "link": "https://github.com/FastTLS"
      }
    ],
    "sidebar": [
      {
        "text": "开始使用",
        "items": [
          {
            "text": "选择工具",
            "link": "/guide/"
          },
          {
            "text": "支持与限制",
            "link": "/concepts/support"
          },
          {
            "text": "指纹概念",
            "link": "/concepts/fingerprints"
          },
          {
            "text": "版本与升级",
            "link": "/releases/"
          }
        ]
      },
      {
        "text": "Fastls · Go",
        "items": [
          {
            "text": "安装与快速开始",
            "link": "/fastls/"
          },
          {
            "text": "Session 与请求响应",
            "link": "/fastls/session"
          },
          {
            "text": "配置与离线注册",
            "link": "/fastls/profiles"
          },
          {
            "text": "profile 规范",
            "link": "/fastls/profile-spec"
          }
        ]
      },
      {
        "text": "Python",
        "items": [
          {
            "text": "完整使用指南",
            "link": "/python/"
          },
          {
            "text": "安装与平台排错",
            "link": "/python/install"
          }
        ]
      },
      {
        "text": "Node.js",
        "items": [
          {
            "text": "完整使用指南",
            "link": "/node/"
          }
        ]
      },
      {
        "text": "Python / Node 功能详解",
        "collapsed": false,
        "items": [
          {
            "text": "请求与响应",
            "link": "/reference/requests"
          },
          {
            "text": "Cookie 与头部",
            "link": "/reference/cookies"
          },
          {
            "text": "会话与连接池",
            "link": "/reference/pooling"
          },
          {
            "text": "流式与超时",
            "link": "/reference/timeouts"
          },
          {
            "text": "流式上传",
            "link": "/reference/upload"
          },
          {
            "text": "HTTP/2 双工",
            "link": "/reference/duplex"
          },
          {
            "text": "SSE",
            "link": "/reference/sse"
          },
          {
            "text": "代理",
            "link": "/reference/proxy"
          },
          {
            "text": "WebSocket",
            "link": "/reference/websocket"
          }
        ]
      },
      {
        "text": "工具与帮助",
        "items": [
          {
            "text": "按场景查用法",
            "link": "/examples/"
          },
          {
            "text": "配套工具",
            "link": "/ecosystem/"
          },
          {
            "text": "排错与反馈",
            "link": "/help/"
          },
          {
            "text": "许可证与免责声明",
            "link": "/legal"
          }
        ]
      },
      {
        "text": "维护与扩展",
        "collapsed": true,
        "items": [
          {
            "text": "C ABI 接口",
            "link": "/reference/abi"
          },
          {
            "text": "维护本站",
            "link": "/maintenance"
          }
        ]
      }
    ],
    "search": {
      "provider": "local",
      "options": {
        "translations": {
          "button": {
            "buttonText": "搜索文档",
            "buttonAriaLabel": "搜索文档"
          },
          "modal": {
            "displayDetails": "显示详细结果",
            "resetButtonTitle": "清空搜索",
            "backButtonTitle": "返回",
            "noResultsText": "没有找到相关内容",
            "footer": {
              "selectText": "选择",
              "navigateText": "切换",
              "closeText": "关闭"
            }
          }
        }
      }
    },
    "outline": {
      "label": "本页目录",
      "level": [
        2,
        3
      ]
    },
    "docFooter": {
      "prev": "上一页",
      "next": "下一页"
    },
    "lastUpdated": {
      "text": "最后更新"
    },
    "footer": {
      "message": "Apache-2.0 · 第三方材料保留原授权",
      "copyright": "Copyright © 2026 FastTLS contributors"
    },
    "socialLinks": [
      {
        "icon": "github",
        "link": "https://github.com/FastTLS"
      }
    ]
  },
  "head": [
    [
      "meta",
      {
        "name": "theme-color",
        "content": "#2563eb"
      }
    ]
  ]
});
