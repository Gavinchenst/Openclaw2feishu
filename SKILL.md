---
name: openclaw-feishu-bridge
description: Connect a Feishu (Lark) bot to OpenClaw via WebSocket long-connection. No public server, domain, or ngrok required. Use when setting up Feishu/Lark as a messaging channel, troubleshooting the Feishu bridge, or managing the bridge service (start/stop/logs). Covers bot creation on Feishu Open Platform, credential setup, bridge startup, systemd/launchd auto-restart, and group chat behavior tuning.
---

# OpenClaw Feishu Bridge

Bridge Feishu bot messages to OpenClaw Gateway over local WebSocket.

## Architecture

```
Feishu user → Feishu cloud ←WS→ bridge.mjs (local) ←WS→ OpenClaw Gateway → AI agent
```

- Feishu SDK connects outbound (no inbound port / public IP needed)
- Bridge authenticates to Gateway using the existing gateway token
- Each Feishu chat maps to a OpenClaw session (`feishu:<chatId>`)

## Setup

### 1. Create Feishu bot

1. Go to [open.feishu.cn/app](https://open.feishu.cn/app) → Create self-built app → Add **Bot** capability
2. Enable permissions: `im:message`, `im:message.group_at_msg`, `im:message.p2p_msg`
3. Events: add `im.message.receive_v1`, set delivery to **WebSocket long-connection**
4. Publish the app (create version → request approval)
5. Note the **App ID** and **App Secret**

### 2. Store secret

```bash
mkdir -p ~/.openclaw/secrets
echo "YOUR_APP_SECRET" > ~/.openclaw/secrets/feishu_app_secret
chmod 600 ~/.openclaw/secrets/feishu_app_secret
```

### 3. Install & run

```bash
cd <skill-dir>/openclaw2feishu
npm install
FEISHU_APP_ID=cli_xxx node bridge.mjs
```

### 4. Auto-start (Linux)

```bash
FEISHU_APP_ID=cli_xxx node setup-service-linux.mjs
systemctl --user enable openclaw-feishu-bridge.service
systemctl --user start openclaw-feishu-bridge.service
```

### 5. Auto-start (macOS)

```bash
FEISHU_APP_ID=cli_xxx node setup-service.mjs
launchctl load ~/Library/LaunchAgents/com.openclaw.feishu-bridge.plist
```

## Diagnostics

```bash
# Check service (Linux)
systemctl --user status openclaw-feishu-bridge.service

# Check service (macOS)
launchctl list | grep feishu

# Logs (Linux/macOS)
tail -f ~/.openclaw/logs/feishu-bridge.err.log

# Stop (Linux)
systemctl --user stop openclaw-feishu-bridge.service

# Stop (macOS)
launchctl unload ~/Library/LaunchAgents/com.openclaw.feishu-bridge.plist
```

## Group chat behavior

Bridge replies only when: user @-mentions the bot, message ends with `?`/`？`, contains request verbs (帮/请/分析/总结…), or calls the bot by name. Customize the name list in `bridge.mjs` → `shouldRespondInGroup()`.

## Environment variables

| Variable | Required | Default |
|---|---|---|
| `FEISHU_APP_ID` | ✅ | — |
| `FEISHU_APP_SECRET_PATH` | — | `~/.openclaw/secrets/feishu_app_secret` |
| `OPENCLAW_CONFIG_PATH` | — | `~/.openclaw/openclaw.json` |
| `OPENCLAW_AGENT_ID` | — | `main` |
| `FEISHU_THINKING_THRESHOLD_MS` | — | `2500` |