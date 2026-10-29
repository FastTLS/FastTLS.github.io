import { defineConfig } from "vitepress";

export default defineConfig({
  "lang": "zh-CN",
  "title": "FastTLS",
  "description": "FastTLS 官方文档：配置 TLS 指纹、HTTP 参数与请求头顺序，使用 Go、Python 或 Node.js 发送请求。",
  "base": "/",
  "cleanUrls": true,
  "lastUpdated": true,
  "head": [
    [
      "meta",
      {
        "name": "theme-color",
        "content": "#2563eb"
      }
    ]
  ],
  "locales": {
    "root": {
      "label": "简体中文",
      "lang": "zh-CN",
      "link": "/",
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
                "text": "认证、重试与离线配置",
                "link": "/reference/reliability"
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
        "langMenuLabel": "选择语言"
      }
    },
    "en": {
      "label": "English",
      "lang": "en-US",
      "link": "/en/",
      "description": "FastTLS documentation: TLS fingerprints, HTTP behavior, Go clients, Python and Node.js SDKs.",
      "themeConfig": {
        "nav": [
          {
            "text": "Get started",
            "link": "/en/guide/"
          },
          {
            "text": "Go",
            "link": "/en/fastls/"
          },
          {
            "text": "Python",
            "link": "/en/python/"
          },
          {
            "text": "Node.js",
            "link": "/en/node/"
          },
          {
            "text": "GitHub",
            "link": "https://github.com/FastTLS"
          }
        ],
        "sidebar": [
          {
            "text": "Get started",
            "items": [
              {
                "text": "Choose a client",
                "link": "/en/guide/"
              },
              {
                "text": "Support and limitations",
                "link": "/en/concepts/support"
              },
              {
                "text": "Fingerprint concepts",
                "link": "/en/concepts/fingerprints"
              },
              {
                "text": "Versions and upgrades",
                "link": "/en/releases/"
              }
            ]
          },
          {
            "text": "Fastls · Go",
            "items": [
              {
                "text": "Installation and first request",
                "link": "/en/fastls/"
              },
              {
                "text": "Sessions and responses",
                "link": "/en/fastls/session"
              },
              {
                "text": "Profiles and offline bundles",
                "link": "/en/fastls/profiles"
              },
              {
                "text": "Profile specification",
                "link": "/en/fastls/profile-spec"
              }
            ]
          },
          {
            "text": "Python",
            "items": [
              {
                "text": "Complete usage guide",
                "link": "/en/python/"
              },
              {
                "text": "Installation help",
                "link": "/en/python/install"
              }
            ]
          },
          {
            "text": "Node.js",
            "items": [
              {
                "text": "Complete usage guide",
                "link": "/en/node/"
              }
            ]
          },
          {
            "text": "SDK feature reference",
            "collapsed": false,
            "items": [
              {
                "text": "Requests and responses",
                "link": "/en/reference/requests"
              },
              {
                "text": "Authentication, retry and offline profiles",
                "link": "/en/reference/reliability"
              },
              {
                "text": "Cookies and headers",
                "link": "/en/reference/cookies"
              },
              {
                "text": "Sessions and pools",
                "link": "/en/reference/pooling"
              },
              {
                "text": "Streaming and timeouts",
                "link": "/en/reference/timeouts"
              },
              {
                "text": "Streaming uploads",
                "link": "/en/reference/upload"
              },
              {
                "text": "HTTP/2 duplex",
                "link": "/en/reference/duplex"
              },
              {
                "text": "SSE",
                "link": "/en/reference/sse"
              },
              {
                "text": "Proxies",
                "link": "/en/reference/proxy"
              },
              {
                "text": "WebSocket",
                "link": "/en/reference/websocket"
              }
            ]
          },
          {
            "text": "Tools and help",
            "items": [
              {
                "text": "Examples by task",
                "link": "/en/examples/"
              },
              {
                "text": "Companion tools",
                "link": "/en/ecosystem/"
              },
              {
                "text": "Troubleshooting",
                "link": "/en/help/"
              },
              {
                "text": "Licenses and disclaimer",
                "link": "/en/legal"
              }
            ]
          },
          {
            "text": "Maintenance and extensions",
            "collapsed": true,
            "items": [
              {
                "text": "C ABI",
                "link": "/en/reference/abi"
              },
              {
                "text": "Maintaining this site",
                "link": "/en/maintenance"
              }
            ]
          }
        ],
        "outline": {
          "label": "On this page",
          "level": [
            2,
            3
          ]
        },
        "docFooter": {
          "prev": "Previous page",
          "next": "Next page"
        },
        "lastUpdated": {
          "text": "Last updated"
        },
        "footer": {
          "message": "Apache-2.0 · Third-party materials retain their licenses",
          "copyright": "Copyright © 2026 FastTLS contributors"
        },
        "langMenuLabel": "Change language"
      }
    }
  },
  "themeConfig": {
    "socialLinks": [
      {
        "icon": "github",
        "link": "https://github.com/FastTLS"
      }
    ],
    "search": {
      "provider": "local",
      "options": {
        "locales": {
          "root": {
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
        }
      }
    }
  }
});
