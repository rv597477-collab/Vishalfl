# Bolt.diy — Full API Reference

> **Base URL:** `http://localhost:5173` (development) · `https://your-domain.com` (production)
>
> All paths below are appended to the base URL. Every JSON request must include the header:
> `Content-Type: application/json`
>
> Authentication uses an **HttpOnly session cookie** (`__bolt_session`) set after Google OAuth login.
> API keys for AI providers are sent via a **cookie named `apiKeys`** (URL-encoded JSON) or stored
> in the database after login (see [Section 2](#2-api-keys--provider-settings)).

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [API Keys & Provider Settings](#2-api-keys--provider-settings)
3. [All AI Provider Models & Key Formats](#3-all-ai-provider-models--key-formats)
4. [User — `/api/me`](#4-user----apime)
5. [User Settings — `/api/user-settings`](#5-user-settings----apiuser-settings)
6. [Projects — `/api/projects`](#6-projects----apiprojects)
7. [Chats — `/api/chats`](#7-chats----apichats)
8. [Chat History — `/api/chat-history`](#8-chat-history----apichat-history)
9. [Messages — `/api/messages`](#9-messages----apimessages)
10. [Files — `/api/files`](#10-files----apifiles)
11. [File Versions — `/api/file-versions`](#11-file-versions----apifile-versions)
12. [Activity Logs — `/api/activity-logs`](#12-activity-logs----apiactivity-logs)
13. [AI Chat (Streaming) — `/api/chat`](#13-ai-chat-streaming----apichat)
14. [Prompt Enhancer — `/api/enhancer`](#14-prompt-enhancer----apienhancer)
15. [Direct LLM Call — `/api/llmcall`](#15-direct-llm-call----apillmcall)
16. [Models & Providers — `/api/models`](#16-models--providers----apimodels)
17. [Configured Providers — `/api/configured-providers`](#17-configured-providers----apiconfigured-providers)
18. [Check Env Key — `/api/check-env-key`](#18-check-env-key----apicheck-env-key)
19. [Export API Keys — `/api/export-api-keys`](#19-export-api-keys----apiexport-api-keys)
20. [GitHub Integration](#20-github-integration)
21. [GitLab Integration](#21-gitlab-integration)
22. [Vercel Deployment — `/api/vercel-deploy`](#22-vercel-deployment----apivercel-deploy)
23. [Netlify Deployment — `/api/netlify-deploy`](#23-netlify-deployment----apinetlify-deploy)
24. [Supabase Integration](#24-supabase-integration)
25. [Web Search — `/api/web-search`](#25-web-search----apiweb-search)
26. [Git Proxy — `/api/git-proxy/*`](#26-git-proxy----apigit-proxy)
27. [System & Diagnostics](#27-system--diagnostics)
28. [MCP (Model Context Protocol)](#28-mcp-model-context-protocol)
29. [App Update — `/api/update`](#29-app-update----apiupdate)
30. [Bug Report — `/api/bug-report`](#30-bug-report----apibug-report)
31. [Health Check — `/api/health`](#31-health-check----apihealth)
32. [Error Reference](#32-error-reference)

---

## 1. Authentication

### 1.1 Start Google Login

```
GET /auth/google
```

No body. Browser is redirected to Google's OAuth consent page.  
Google then redirects back to `/auth/google.callback`.

---

### 1.2 Google OAuth Callback

```
GET /auth/google.callback?code=<google_code>&state=<csrf_state>
```

Handled automatically by the browser after Google login. On success, sets:

```
Set-Cookie: __bolt_session=<encrypted_value>; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=2592000
```

---

### 1.3 Logout

```
GET /auth/logout
```

Clears the session cookie and redirects to `/login`.

---

## 2. API Keys & Provider Settings

AI provider keys can be supplied two ways:

### Option A — Cookie (no login required)

Set a cookie named `apiKeys` whose value is `encodeURIComponent(JSON.stringify({...}))`:

```
Cookie: apiKeys=%7B%22OPENAI_API_KEY%22%3A%22sk-proj-...%22%7D
```

Decoded value example:

```json
{
  "OPENAI_API_KEY":              "sk-proj-...",
  "ANTHROPIC_API_KEY":           "sk-ant-api03-...",
  "GOOGLE_GENERATIVE_AI_API_KEY":"AIzaSy...",
  "GROQ_API_KEY":                "gsk_...",
  "DEEPSEEK_API_KEY":            "sk-...",
  "MISTRAL_API_KEY":             "...",
  "COHERE_API_KEY":              "...",
  "TOGETHER_API_KEY":            "...",
  "FIREWORKS_API_KEY":           "fw_...",
  "HYPERBOLIC_API_KEY":          "...",
  "CEREBRAS_API_KEY":            "...",
  "XAI_API_KEY":                 "xai-...",
  "MOONSHOT_API_KEY":            "sk-...",
  "PERPLEXITY_API_KEY":          "pplx-...",
  "OPEN_ROUTER_API_KEY":         "sk-or-v1-...",
  "AWS_BEDROCK_CONFIG":          "{\"region\":\"us-east-1\",\"accessKeyId\":\"AKIA...\",\"secretAccessKey\":\"...\"}",
  "GITHUB_API_KEY":              "github_pat_...",
  "ZAI_API_KEY":                 "...",
  "VITE_GITHUB_ACCESS_TOKEN":    "ghp_...",
  "VITE_GITLAB_ACCESS_TOKEN":    "glpat-...",
  "VITE_VERCEL_ACCESS_TOKEN":    "...",
  "VITE_NETLIFY_ACCESS_TOKEN":   "...",
  "VITE_SUPABASE_ACCESS_TOKEN":  "..."
}
```

Also set a cookie named `providers` for per-provider settings:

```json
{
  "OpenAI": {
    "enabled": true,
    "baseUrl": "https://api.openai.com/v1",
    "selected_model": "gpt-4o"
  },
  "Ollama": {
    "enabled": true,
    "baseUrl": "http://localhost:11434"
  },
  "LMStudio": {
    "enabled": true,
    "baseUrl": "http://localhost:1234"
  },
  "Together": {
    "enabled": true,
    "baseUrl": "https://api.together.xyz/v1"
  }
}
```

### Option B — Database (login required)

After logging in with Google, use [`POST /api/user-settings`](#5-user-settings----apiuser-settings) to persist keys to the database. These override cookie values and survive browser clears.

---

## 3. All AI Provider Models & Key Formats

### OpenAI

| Env Var | `OPENAI_API_KEY` |
|---------|----------------|
| Key format | `sk-proj-...` or `sk-...` |
| Get key | https://platform.openai.com/api-keys |

**Static models (always available):**

| Model ID | Label | Context | Max Output |
|----------|-------|---------|-----------|
| `gpt-4o` | GPT-4o | 128 K | 4 096 |
| `gpt-4o-mini` | GPT-4o Mini | 128 K | 4 096 |
| `gpt-3.5-turbo` | GPT-3.5 Turbo | 16 K | 4 096 |
| `o1-preview` | o1-preview (reasoning) | 128 K | 32 000 |
| `o1-mini` | o1-mini (reasoning) | 128 K | 65 000 |

Dynamic models are fetched live from `https://api.openai.com/v1/models`.

---

### Anthropic

| Env Var | `ANTHROPIC_API_KEY` |
|---------|-------------------|
| Key format | `sk-ant-api03-...` |
| Get key | https://console.anthropic.com/settings/keys |

**Static models:**

| Model ID | Label | Context | Max Output |
|----------|-------|---------|-----------|
| `claude-3-5-sonnet-20241022` | Claude 3.5 Sonnet | 200 K | 128 000 |
| `claude-3-haiku-20240307` | Claude 3 Haiku | 200 K | 128 000 |
| `claude-opus-4-20250514` | Claude 4 Opus | 200 K | 32 000 |

Dynamic models fetched from `https://api.anthropic.com/v1/models`.

---

### Google Gemini

| Env Var | `GOOGLE_GENERATIVE_AI_API_KEY` |
|---------|-------------------------------|
| Key format | `AIzaSy...` |
| Get key | https://aistudio.google.com/app/apikey |

**Static models:**

| Model ID | Label | Context | Max Output |
|----------|-------|---------|-----------|
| `gemini-1.5-pro` | Gemini 1.5 Pro | 2 000 K | 8 192 |
| `gemini-1.5-flash` | Gemini 1.5 Flash | 1 000 K | 8 192 |

Dynamic models fetched from `https://generativelanguage.googleapis.com/v1beta/models`.

---

### Groq

| Env Var | `GROQ_API_KEY` |
|---------|---------------|
| Key format | `gsk_...` |
| Get key | https://console.groq.com/keys |

**Static models:**

| Model ID | Label | Context | Max Output |
|----------|-------|---------|-----------|
| `llama-3.1-8b-instant` | Llama 3.1 8B | 128 K | 8 192 |
| `llama-3.3-70b-versatile` | Llama 3.3 70B | 128 K | 8 192 |

Dynamic models fetched from `https://api.groq.com/openai/v1/models`.

---

### DeepSeek

| Env Var | `DEEPSEEK_API_KEY` |
|---------|-------------------|
| Key format | `sk-...` |
| Get key | https://platform.deepseek.com/apiKeys |

**Static models:**

| Model ID | Label | Context |
|----------|-------|---------|
| `deepseek-coder` | Deepseek-Coder | 8 K |
| `deepseek-chat` | Deepseek-Chat | 8 K |
| `deepseek-reasoner` | Deepseek-Reasoner | 8 K |
| `deepseek-v3.2` | DeepSeek V3.2 (Coding + Tool Use) | 64 K |
| `deepseek-v3.2-speciale` | DeepSeek V3.2 Speciale (High-Compute) | 64 K |

---

### xAI (Grok)

| Env Var | `XAI_API_KEY` |
|---------|--------------|
| Key format | `xai-...` |
| Get key | https://docs.x.ai/docs/quickstart#creating-an-api-key |
| Base URL | `https://api.x.ai/v1` |

**Static models:**

| Model ID | Label | Context |
|----------|-------|---------|
| `grok-4` | xAI Grok 4 | 256 K |
| `grok-4-07-09` | xAI Grok 4 (07-09) | 256 K |
| `grok-3-mini` | xAI Grok 3 Mini | 131 K |
| `grok-3-mini-fast` | xAI Grok 3 Mini Fast | 131 K |
| `grok-code-fast-1` | xAI Grok Code Fast 1 | 131 K |

---

### Mistral

| Env Var | `MISTRAL_API_KEY` |
|---------|------------------|
| Key format | alphanumeric string |
| Get key | https://console.mistral.ai/api-keys/ |

**Static models:**

| Model ID | Label | Context |
|----------|-------|---------|
| `open-mistral-7b` | Mistral 7B | 8 K |
| `open-mixtral-8x7b` | Mistral 8x7B | 8 K |
| `open-mixtral-8x22b` | Mistral 8x22B | 8 K |
| `open-codestral-mamba` | Codestral Mamba | 8 K |
| `open-mistral-nemo` | Mistral Nemo | 8 K |
| `ministral-8b-latest` | Mistral 8B | 8 K |
| `mistral-small-latest` | Mistral Small | 8 K |
| `codestral-latest` | Codestral | 8 K |

---

### Cohere

| Env Var | `COHERE_API_KEY` |
|---------|----------------|
| Key format | alphanumeric string |
| Get key | https://dashboard.cohere.com/api-keys |

**Static models:**

| Model ID | Label | Context |
|----------|-------|---------|
| `command-r-plus-08-2024` | Command R plus Latest | 4 K |
| `command-r-08-2024` | Command R Latest | 4 K |
| `command-r-plus` | Command R plus | 4 K |
| `command-r` | Command R | 4 K |
| `command` | Command | 4 K |
| `command-nightly` | Command Nightly | 4 K |
| `command-light` | Command Light | 4 K |
| `command-light-nightly` | Command Light Nightly | 4 K |
| `c4ai-aya-expanse-8b` | c4AI Aya Expanse 8b | 4 K |

---

### Together AI

| Env Var | `TOGETHER_API_KEY` |
|---------|------------------|
| Base URL Env | `TOGETHER_API_BASE_URL` (default: `https://api.together.xyz/v1`) |
| Key format | alphanumeric string |
| Get key | https://api.together.xyz/settings/api-keys |

**Static models:**

| Model ID | Label | Context |
|----------|-------|---------|
| `meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo` | Llama 3.2 90B Vision | 128 K |
| `mistralai/Mixtral-8x7B-Instruct-v0.1` | Mixtral 8x7B Instruct | 32 K |

Dynamic models fetched from `https://api.together.xyz/v1/models`.

---

### Fireworks

| Env Var | `FIREWORKS_API_KEY` |
|---------|-------------------|
| Key format | `fw_...` |
| Get key | https://fireworks.ai/api-keys |

**Static models:**

| Model ID | Label | Context |
|----------|-------|---------|
| `accounts/fireworks/models/qwen3-coder-480b-a35b-instruct` | Qwen3-Coder 480B (Best for Coding) | 262 K |
| `accounts/fireworks/models/qwen3-coder-30b-a3b-instruct` | Qwen3-Coder 30B (Fast Coding) | 262 K |
| `accounts/fireworks/models/llama-v3p1-405b-instruct` | Llama 3.1 405B Instruct | 128 K |
| `accounts/fireworks/models/llama-v3p1-70b-instruct` | Llama 3.1 70B Instruct | 128 K |
| `accounts/fireworks/models/llama-v3p1-8b-instruct` | Llama 3.1 8B Instruct | 128 K |
| `accounts/fireworks/models/deepseek-r1` | DeepSeek R1 (Reasoning) | 64 K |
| `accounts/fireworks/models/qwen2p5-72b-instruct` | Qwen 2.5 72B Instruct | 128 K |
| `accounts/fireworks/models/firefunction-v2` | FireFunction V2 | 8 K |

---

### Hyperbolic

| Env Var | `HYPERBOLIC_API_KEY` |
|---------|---------------------|
| Key format | alphanumeric string |
| Get key | https://app.hyperbolic.xyz/settings |

**Static models:**

| Model ID | Label | Context |
|----------|-------|---------|
| `Qwen/Qwen2.5-Coder-32B-Instruct` | Qwen 2.5 Coder 32B Instruct | 8 K |
| `Qwen/Qwen2.5-72B-Instruct` | Qwen2.5-72B-Instruct | 8 K |
| `deepseek-ai/DeepSeek-V2.5` | DeepSeek-V2.5 | 8 K |
| `Qwen/QwQ-32B-Preview` | QwQ-32B-Preview | 8 K |
| `Qwen/Qwen2-VL-72B-Instruct` | Qwen2-VL-72B-Instruct | 8 K |

---

### Cerebras

| Env Var | `CEREBRAS_API_KEY` |
|---------|------------------|
| Key format | alphanumeric string |
| Get key | https://cloud.cerebras.ai/settings |

**Static models:**

| Model ID | Label | Context |
|----------|-------|---------|
| `qwen3-coder-480b` | Qwen3-Coder 480B (2000 tok/s) | 262 K |
| `llama3.1-8b` | Llama 3.1 8B | 8 K |
| `gpt-oss-120b` | GPT OSS 120B (Reasoning) | 8 K |
| `qwen-3-235b-a22b-instruct-2507` | Qwen 3 235B A22B Instruct | 8 K |
| `qwen-3-235b-a22b-thinking-2507` | Qwen 3 235B A22B Thinking | 8 K |
| `zai-glm-4.6` | ZAI GLM 4.6 (Coding) | 8 K |
| `zai-glm-4.7` | ZAI GLM 4.7 (Reasoning) | 8 K |

---

### Moonshot (Kimi)

| Env Var | `MOONSHOT_API_KEY` |
|---------|------------------|
| Key format | `sk-...` |
| Get key | https://platform.moonshot.ai/console/api-keys |

**Static models:**

| Model ID | Label | Context |
|----------|-------|---------|
| `moonshot-v1-8k` | Moonshot v1 8K | 8 K |
| `moonshot-v1-32k` | Moonshot v1 32K | 32 K |
| `moonshot-v1-128k` | Moonshot v1 128K | 128 K |
| `moonshot-v1-auto` | Moonshot v1 Auto | 128 K |
| `moonshot-v1-8k-vision-preview` | Moonshot v1 8K Vision | 8 K |
| `moonshot-v1-32k-vision-preview` | Moonshot v1 32K Vision | 32 K |
| `moonshot-v1-128k-vision-preview` | Moonshot v1 128K Vision | 128 K |
| `kimi-latest` | Kimi Latest | 128 K |
| `kimi-k2-0711-preview` | Kimi K2 Preview | 128 K |
| `kimi-k2-turbo-preview` | Kimi K2 Turbo | 128 K |
| `kimi-thinking-preview` | Kimi Thinking | 128 K |

---

### Perplexity

| Env Var | `PERPLEXITY_API_KEY` |
|---------|---------------------|
| Key format | `pplx-...` |
| Get key | https://www.perplexity.ai/settings/api |
| Base URL | `https://api.perplexity.ai/` |

**Static models:**

| Model ID | Label | Context |
|----------|-------|---------|
| `sonar` | Sonar | 8 K |
| `sonar-pro` | Sonar Pro | 8 K |
| `sonar-reasoning-pro` | Sonar Reasoning Pro | 8 K |

---

### OpenRouter

| Env Var | `OPEN_ROUTER_API_KEY` |
|---------|----------------------|
| Key format | `sk-or-v1-...` |
| Get key | https://openrouter.ai/settings/keys |

**Static models (many more available dynamically):**

| Model ID | Label | Context |
|----------|-------|---------|
| `anthropic/claude-3.5-sonnet` | Claude 3.5 Sonnet | 200 K |
| `openai/gpt-4o` | GPT-4o | 128 K |

Dynamic models fetched from `https://openrouter.ai/api/v1/models` (no key needed to list).

---

### Amazon Bedrock

| Env Var | `AWS_BEDROCK_CONFIG` |
|---------|---------------------|
| Key format | JSON string: `{"region":"us-east-1","accessKeyId":"AKIA...","secretAccessKey":"..."}` |
| Get credentials | https://console.aws.amazon.com/iam/home |

**Static models:**

| Model ID | Label | Context |
|----------|-------|---------|
| `anthropic.claude-3-5-sonnet-20241022-v2:0` | Claude 3.5 Sonnet v2 (Bedrock) | 200 K |
| `anthropic.claude-3-5-sonnet-20240620-v1:0` | Claude 3.5 Sonnet (Bedrock) | 4 K |
| `anthropic.claude-3-sonnet-20240229-v1:0` | Claude 3 Sonnet (Bedrock) | 4 K |
| `anthropic.claude-3-haiku-20240307-v1:0` | Claude 3 Haiku (Bedrock) | 4 K |
| `amazon.nova-pro-v1:0` | Amazon Nova Pro (Bedrock) | 5 K |
| `amazon.nova-lite-v1:0` | Amazon Nova Lite (Bedrock) | 5 K |
| `mistral.mistral-large-2402-v1:0` | Mistral Large 24.02 (Bedrock) | 8 K |

---

### GitHub Models

| Env Var | `GITHUB_API_KEY` |
|---------|----------------|
| Key format | `github_pat_...` or `ghp_...` |
| Get key | https://github.com/settings/personal-access-tokens |
| Base URL | `https://models.github.ai/inference` |

**Static models:**

| Model ID | Label | Context | Max Output |
|----------|-------|---------|-----------|
| `openai/gpt-4o` | GPT-4o | 131 K | 4 096 |
| `openai/gpt-4o-mini` | GPT-4o Mini | 131 K | 4 096 |
| `openai/o1-preview` | o1-preview | 128 K | 32 000 |
| `openai/o1-mini` | o1-mini | 128 K | 65 000 |
| `openai/o1` | o1 | 200 K | 100 000 |
| `openai/gpt-4.1` | GPT-4.1 | 1 048 K | 32 768 |
| `openai/gpt-4.1-mini` | GPT-4.1-mini | 1 048 K | 32 768 |
| `deepseek/deepseek-r1` | DeepSeek-R1 | 128 K | 4 096 |

---

### Z.ai (ZhipuAI)

| Env Var | `ZAI_API_KEY` |
|---------|--------------|
| Base URL Env | `ZAI_BASE_URL` (default: `https://api.z.ai/api/coding/paas/v4`) |
| Key format | alphanumeric string |
| Get key | https://open.bigmodel.cn/usercenter/apikeys |

**Static models:**

| Model ID | Label | Context | Max Output |
|----------|-------|---------|-----------|
| `glm-4.6` | GLM-4.6 (200K) | 200 K | 65 536 |
| `glm-4.5` | GLM-4.5 (128K) | 128 K | 65 536 |
| `glm-4.5-flash` | GLM-4.5 Flash (128K) | 128 K | 65 536 |

---

### Ollama (Local)

| Env Var | `OLLAMA_API_BASE_URL` |
|---------|----------------------|
| Default URL | `http://localhost:11434` |
| Key | None required |
| Download | https://ollama.com/download |

Models are fetched dynamically from `GET <baseUrl>/api/tags`.

---

### LM Studio (Local)

| Env Var | `LMSTUDIO_API_BASE_URL` |
|---------|------------------------|
| Default URL | `http://localhost:1234` |
| Key | None required |
| Download | https://lmstudio.ai/ |

Models are fetched dynamically from `GET <baseUrl>/v1/models`.

---

### HuggingFace

| Env Var | `HuggingFace_API_KEY` |
|---------|----------------------|
| Key format | `hf_...` |
| Get key | https://huggingface.co/settings/tokens |

Dynamic models only, fetched from the HuggingFace Inference API.

---

## 4. User — `/api/me`

### Get current user

```
GET /api/me
Cookie: __bolt_session=<session>
```

**200 — logged in:**
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "display_name": "John Doe",
    "avatar_url": "https://lh3.googleusercontent.com/..."
  }
}
```

**200 — not logged in:**
```json
{ "user": null }
```

---

## 5. User Settings — `/api/user-settings`

### Get saved API keys and provider settings

```
GET /api/user-settings
Cookie: __bolt_session=<session>
```

**200:**
```json
{
  "apiKeys": {
    "OPENAI_API_KEY": "sk-proj-...",
    "ANTHROPIC_API_KEY": "sk-ant-api03-..."
  },
  "providerSettings": {
    "OpenAI": { "enabled": true, "selected_model": "gpt-4o" }
  }
}
```

---

### Save API keys and/or provider settings

```
POST /api/user-settings
Cookie: __bolt_session=<session>
Content-Type: application/json
```

**Full request body:**
```json
{
  "apiKeys": {
    "OPENAI_API_KEY":              "sk-proj-...",
    "ANTHROPIC_API_KEY":           "sk-ant-api03-...",
    "GOOGLE_GENERATIVE_AI_API_KEY":"AIzaSy...",
    "GROQ_API_KEY":                "gsk_...",
    "DEEPSEEK_API_KEY":            "sk-...",
    "MISTRAL_API_KEY":             "...",
    "COHERE_API_KEY":              "...",
    "TOGETHER_API_KEY":            "...",
    "FIREWORKS_API_KEY":           "fw_...",
    "HYPERBOLIC_API_KEY":          "...",
    "CEREBRAS_API_KEY":            "...",
    "XAI_API_KEY":                 "xai-...",
    "MOONSHOT_API_KEY":            "sk-...",
    "PERPLEXITY_API_KEY":          "pplx-...",
    "OPEN_ROUTER_API_KEY":         "sk-or-v1-...",
    "AWS_BEDROCK_CONFIG":          "{\"region\":\"us-east-1\",\"accessKeyId\":\"AKIA...\",\"secretAccessKey\":\"...\"}",
    "GITHUB_API_KEY":              "github_pat_...",
    "ZAI_API_KEY":                 "...",
    "VITE_GITHUB_ACCESS_TOKEN":    "ghp_...",
    "VITE_GITLAB_ACCESS_TOKEN":    "glpat-...",
    "VITE_VERCEL_ACCESS_TOKEN":    "...",
    "VITE_NETLIFY_ACCESS_TOKEN":   "...",
    "VITE_SUPABASE_ACCESS_TOKEN":  "..."
  },
  "providerSettings": {
    "OpenAI": {
      "enabled": true,
      "baseUrl": "https://api.openai.com/v1",
      "selected_model": "gpt-4o"
    },
    "Anthropic": {
      "enabled": true,
      "selected_model": "claude-3-5-sonnet-20241022"
    },
    "Ollama": {
      "enabled": true,
      "baseUrl": "http://localhost:11434"
    },
    "LMStudio": {
      "enabled": true,
      "baseUrl": "http://localhost:1234"
    },
    "Together": {
      "enabled": true,
      "baseUrl": "https://api.together.xyz/v1"
    }
  }
}
```

> Omit either top-level key to leave it unchanged.

**200:**
```json
{ "ok": true }
```

**401:**
```json
{ "error": "Unauthorized" }
```

---

## 6. Projects — `/api/projects`

### List projects

```
GET /api/projects?limit=50&offset=0
Cookie: __bolt_session=<session>
```

| Query param | Type | Default | Description |
|-------------|------|---------|-------------|
| `limit` | number | `50` | Max results |
| `offset` | number | `0` | Skip N results |

**200:**
```json
{
  "projects": [
    {
      "id": "proj_abc123",
      "user_id": "usr_xyz",
      "slug": "my-project-a1b2c3d4",
      "name": "My Project",
      "description": "A description",
      "status": "active",
      "source_type": "webcontainer",
      "root_path": "/home/project",
      "metadata_json": "{}",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T12:45:00.000Z"
    }
  ]
}
```

---

### Create project

```
POST /api/projects
Cookie: __bolt_session=<session>
Content-Type: application/json
```

```json
{
  "name": "My New Project",
  "description": "Optional description"
}
```

**200:**
```json
{
  "project": {
    "id": "proj_abc123",
    "user_id": "usr_xyz",
    "slug": "my-new-project-a1b2c3d4",
    "name": "My New Project",
    "description": "Optional description",
    "status": "active",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Update project

```
POST /api/projects
Cookie: __bolt_session=<session>
Content-Type: application/json
```

```json
{
  "action": "update",
  "id": "proj_abc123",
  "name": "New Name",
  "description": "New description",
  "status": "archived"
}
```

> `status` options: `"active"` · `"archived"` · `"deleted"`

**200:**
```json
{ "project": { ...updated project... } }
```

---

## 7. Chats — `/api/chats`

### List chats for a project

```
GET /api/chats?projectId=proj_abc123
Cookie: __bolt_session=<session>
```

**200:**
```json
{
  "chats": [
    {
      "id": "chat_xyz789",
      "project_id": "proj_abc123",
      "user_id": "usr_xyz",
      "url_id": "my-chat-slug",
      "title": "Chat Title",
      "description": "description",
      "status": "active",
      "metadata_json": "{}",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T12:45:00.000Z"
    }
  ]
}
```

---

### Create chat

```
POST /api/chats
Cookie: __bolt_session=<session>
Content-Type: application/json
```

```json
{
  "projectId": "proj_abc123",
  "urlId": "my-chat-slug",
  "title": "Chat about feature X",
  "description": "Detailed description"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `projectId` | **Yes** | Parent project |
| `urlId` | No | Auto-generated UUID slice if omitted |
| `title` | No | |
| `description` | No | |

**200:**
```json
{
  "chat": {
    "id": "chat_xyz789",
    "project_id": "proj_abc123",
    "url_id": "my-chat-slug",
    "title": "Chat about feature X",
    "status": "active",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

---

### Update chat

```
POST /api/chats
Cookie: __bolt_session=<session>
Content-Type: application/json
```

```json
{
  "action": "update",
  "id": "chat_xyz789",
  "title": "Updated Title",
  "description": "Updated description",
  "latestMessageAt": "2024-01-16T09:00:00.000Z"
}
```

**200:**
```json
{ "chat": { ...updated chat... } }
```

---

### Delete chat

```
POST /api/chats
Cookie: __bolt_session=<session>
Content-Type: application/json
```

```json
{
  "action": "delete",
  "id": "chat_xyz789"
}
```

**200:**
```json
{ "ok": true }
```

---

## 8. Chat History — `/api/chat-history`

### List all chats (with no messages)

```
GET /api/chat-history
GET /api/chat-history?projectId=proj_abc123
Cookie: __bolt_session=<session>
```

**200:**
```json
{
  "chats": [
    {
      "id": "chat_xyz789",
      "urlId": "my-chat-slug",
      "description": "Chat title",
      "messages": [],
      "timestamp": "2024-01-15T12:45:00.000Z"
    }
  ],
  "projectId": "proj_abc123"
}
```

---

### Get one chat with all messages

```
GET /api/chat-history?id=my-chat-slug
GET /api/chat-history?id=chat_xyz789&projectId=proj_abc123
Cookie: __bolt_session=<session>
```

**200:**
```json
{
  "chat": {
    "id": "chat_xyz789",
    "urlId": "my-chat-slug",
    "description": "Chat about feature X",
    "messages": [
      { "id": "msg_001", "role": "user",      "content": "Build me a React todo app" },
      { "id": "msg_002", "role": "assistant", "content": "Sure! Here is the code..." }
    ],
    "timestamp": "2024-01-15T12:45:00.000Z",
    "metadata": {}
  }
}
```

---

### Save (upsert) full chat history

Replaces all existing messages for the chat.

```
POST /api/chat-history
Cookie: __bolt_session=<session>
Content-Type: application/json
```

```json
{
  "id": "my-chat-slug",
  "projectId": "proj_abc123",
  "urlId": "my-chat-slug",
  "description": "Chat about feature X",
  "timestamp": "2024-01-15T12:45:00.000Z",
  "metadata": { "anyKey": "anyValue" },
  "messages": [
    { "id": "msg_001", "role": "user",      "content": "Build me a React todo app" },
    { "id": "msg_002", "role": "assistant", "content": "Here is the code..." }
  ]
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `id` | **Yes** | Chat ID or URL ID |
| `projectId` | No | Uses default project if omitted |
| `urlId` | No | |
| `description` | No | Used as chat title |
| `timestamp` | No | ISO 8601 string |
| `metadata` | No | Arbitrary JSON object |
| `messages` | No | Full array replaces all existing messages |
| `action` | No | `"delete"` to soft-delete the chat |

**200:**
```json
{ "ok": true, "chatId": "chat_xyz789", "urlId": "my-chat-slug" }
```

---

### Delete chat (via chat-history)

```
POST /api/chat-history
Cookie: __bolt_session=<session>
Content-Type: application/json
```

```json
{
  "action": "delete",
  "id": "my-chat-slug",
  "projectId": "proj_abc123"
}
```

**200:**
```json
{ "ok": true }
```

---

## 9. Messages — `/api/messages`

### List messages for a chat

```
GET /api/messages?chatId=chat_xyz789
Cookie: __bolt_session=<session>
```

**200:**
```json
{
  "messages": [
    {
      "id": "msg_001",
      "chat_id": "chat_xyz789",
      "project_id": "proj_abc123",
      "user_id": "usr_xyz",
      "role": "user",
      "sequence_no": 1,
      "content_text": "Build me a React app",
      "parts_json": null,
      "model_name": null,
      "provider_name": null,
      "token_usage_json": null,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### Append single message

```
POST /api/messages
Cookie: __bolt_session=<session>
Content-Type: application/json
```

```json
{
  "message": {
    "id": "msg_003",
    "chatId": "chat_xyz789",
    "projectId": "proj_abc123",
    "role": "user",
    "sequenceNo": 3,
    "contentText": "Now add TypeScript support",
    "modelName": null,
    "providerName": null
  }
}
```

**200:**
```json
{ "message": { ...saved message... } }
```

---

### Append multiple messages

```
POST /api/messages
Cookie: __bolt_session=<session>
Content-Type: application/json
```

```json
{
  "messages": [
    {
      "id": "msg_003",
      "chatId": "chat_xyz789",
      "projectId": "proj_abc123",
      "role": "user",
      "sequenceNo": 3,
      "contentText": "Now add TypeScript"
    },
    {
      "id": "msg_004",
      "chatId": "chat_xyz789",
      "projectId": "proj_abc123",
      "role": "assistant",
      "sequenceNo": 4,
      "contentText": "Sure, here is the TypeScript version...",
      "modelName": "gpt-4o",
      "providerName": "OpenAI"
    }
  ]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | **Yes** | Unique message ID |
| `chatId` | string | **Yes** | Parent chat ID |
| `projectId` | string | **Yes** | Parent project ID |
| `role` | string | **Yes** | `"user"` · `"assistant"` · `"system"` · `"tool"` |
| `sequenceNo` | number | **Yes** | Order within chat (1-based) |
| `contentText` | string | **Yes** | Message text |
| `modelName` | string | No | Model used for assistant messages |
| `providerName` | string | No | Provider for assistant messages |

**200:**
```json
{ "messages": [ ...saved messages... ] }
```

---

## 10. Files — `/api/files`

### List all files in a project

```
GET /api/files
GET /api/files?projectId=proj_abc123
Cookie: __bolt_session=<session>
```

**200:**
```json
{
  "files": [
    {
      "id": "file_abc",
      "project_id": "proj_abc123",
      "path": "src/index.ts",
      "name": "index.ts",
      "node_type": "file",
      "mime_type": "application/typescript",
      "extension": "ts",
      "is_binary": 0,
      "content_text": "console.log('hello');",
      "content_sha256": "abc123...",
      "size_bytes": 21,
      "is_deleted": 0,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T12:45:00.000Z"
    }
  ],
  "projectId": "proj_abc123"
}
```

---

### Create or update a file

```
POST /api/files
Cookie: __bolt_session=<session>
Content-Type: application/json
```

```json
{
  "action": "upsert",
  "projectId": "proj_abc123",
  "path": "src/components/Button.tsx",
  "nodeType": "file",
  "contentText": "import React from 'react';\nexport const Button = () => <button>Click</button>;",
  "isBinary": false,
  "source": "user"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `action` | **Yes** | Must be `"upsert"` |
| `path` | **Yes** | Full relative path from project root |
| `nodeType` | **Yes** | `"file"` · `"folder"` |
| `projectId` | No | Uses default project if omitted |
| `contentText` | No | UTF-8 text content (files only) |
| `isBinary` | No | `false` default |
| `source` | No | `"user"` (default) · `"ai"` |

**200:**
```json
{
  "file": {
    "id": "file_abc",
    "project_id": "proj_abc123",
    "path": "src/components/Button.tsx",
    "name": "Button.tsx",
    "node_type": "file",
    "extension": "tsx",
    "is_binary": 0,
    "content_text": "...",
    "size_bytes": 72,
    "is_deleted": 0,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Delete a file or folder

Deleting a folder path also deletes all children.

```
POST /api/files
Cookie: __bolt_session=<session>
Content-Type: application/json
```

```json
{
  "action": "delete",
  "projectId": "proj_abc123",
  "path": "src/components/Button.tsx",
  "source": "user"
}
```

**200:**
```json
{ "ok": true }
```

---

## 11. File Versions — `/api/file-versions`

### Get version history for a file

```
GET /api/file-versions?path=src/index.ts&projectId=proj_abc123
Cookie: __bolt_session=<session>
```

**200:**
```json
{
  "versions": [
    {
      "id": "ver_001",
      "file_id": "file_abc",
      "project_id": "proj_abc123",
      "version_no": 3,
      "change_type": "update",
      "content_text": "// version 3 content",
      "size_bytes": 100,
      "created_by_user_id": "usr_xyz",
      "created_at": "2024-01-15T12:00:00.000Z"
    }
  ],
  "file": { ...file object... }
}
```

`change_type` values: `"create"` · `"update"` · `"delete"` · `"restore"`

---

### Restore a file to an earlier version

```
POST /api/file-versions
Cookie: __bolt_session=<session>
Content-Type: application/json
```

```json
{
  "action": "restore",
  "projectId": "proj_abc123",
  "path": "src/index.ts",
  "versionNo": 2
}
```

**200:**
```json
{
  "file": {
    "path": "src/index.ts",
    "contentText": "// version 2 content..."
  }
}
```

---

## 12. Activity Logs — `/api/activity-logs`

### Get activity logs for a project

```
GET /api/activity-logs?projectId=proj_abc123&limit=100&offset=0
Cookie: __bolt_session=<session>
```

| Query param | Default |
|-------------|---------|
| `projectId` | default project |
| `limit` | `100` |
| `offset` | `0` |

**200:**
```json
{
  "activity": [
    {
      "id": "log_001",
      "user_id": "usr_xyz",
      "project_id": "proj_abc123",
      "chat_id": "chat_xyz789",
      "category": "file",
      "action": "created",
      "level": "info",
      "summary": "Created src/index.ts",
      "details_json": "{}",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "projectId": "proj_abc123"
}
```

**Category values:** `"project"` · `"chat"` · `"file"` · `"message"` · `"system"`  
**Action values:** `"created"` · `"updated"` · `"deleted"` · `"archived"` · `"renamed"` · `"restored"` · `"ai-updated"`

---

## 13. AI Chat (Streaming) — `/api/chat`

The core endpoint. Sends a conversation to any configured LLM and streams back the response using Server-Sent Events.

```
POST /api/chat
Content-Type: application/json
Cookie: apiKeys=<url_encoded_keys>; providers=<url_encoded_settings>
       [optional: __bolt_session=<session> if using DB-stored keys]
```

### Complete request body

```json
{
  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "content": "[Model: gpt-4o]\n\n[Provider: OpenAI]\n\nBuild me a React todo app with TypeScript"
    }
  ],
  "files": {
    "/home/project/src/main.tsx": {
      "content": "import React from 'react';"
    },
    "/home/project/package.json": {
      "content": "{\"name\":\"my-app\",\"dependencies\":{\"react\":\"^18.0.0\"}}"
    }
  },
  "promptId": "default",
  "contextOptimization": true,
  "chatMode": "build",
  "designScheme": {
    "primary": "#3b82f6",
    "secondary": "#64748b",
    "font": "Inter",
    "borderRadius": "0.5rem"
  },
  "maxLLMSteps": 10,
  "supabase": {
    "isConnected": true,
    "hasSelectedProject": true,
    "credentials": {
      "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "supabaseUrl": "https://xyz.supabase.co"
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messages` | array | **Yes** | Conversation history. Each item: `{ id, role, content }`. The **last user message** must start with `[Model: <model_id>]\n\n[Provider: <provider_name>]\n\n<your prompt>` |
| `files` | object | No | Map of absolute file paths → `{ content: string }`. Used as code context |
| `promptId` | string | No | System prompt variant. Default: `"default"` |
| `contextOptimization` | boolean | No | When `true`, the API summarizes the conversation and selects relevant files before calling the LLM |
| `chatMode` | string | No | `"build"` — generates and writes code files; `"discuss"` — conversational only, no file writes |
| `designScheme` | object | No | UI design preferences injected into the system prompt |
| `maxLLMSteps` | number | No | Maximum number of sequential LLM tool-call iterations. Default: `10` |
| `supabase` | object | No | Supabase connection details for database-aware code generation |

### Model + Provider annotation format

The first `user` message in each exchange **must** start with:

```
[Model: <exact_model_id>]

[Provider: <exact_provider_name>]

<your actual prompt>
```

**Examples:**
```
[Model: gpt-4o]

[Provider: OpenAI]

Build me a full-stack todo app with React and Node.js

---

[Model: claude-3-5-sonnet-20241022]

[Provider: Anthropic]

Review this code and suggest improvements

---

[Model: llama3.1-8b]

[Provider: Ollama]

Explain recursion with an example
```

### API key resolution order

1. User's DB-stored keys (if `__bolt_session` cookie is present)
2. `apiKeys` cookie (URL-encoded JSON)
3. `providers` cookie for provider settings
4. Server environment variables

### Streaming response

```
HTTP/1.1 200 OK
Content-Type: text/event-stream; charset=utf-8
Connection: keep-alive
Cache-Control: no-cache
```

**Chunk format** (Vercel AI SDK data stream):

```
# Text chunk (the actual AI response content):
0:"Hello! I'll help you build that React app.\n"

# Progress update — step starting:
2:[{"type":"progress","label":"response","status":"in-progress","order":1,"message":"Generating Response"}]

# Progress update — step complete:
2:[{"type":"progress","label":"response","status":"complete","order":2,"message":"Response Generated"}]

# Context summary (when contextOptimization=true):
2:[{"type":"progress","label":"summary","status":"in-progress","order":1,"message":"Analysing Request"}]
2:[{"type":"chatSummary","summary":"User wants a React todo app","chatId":"msg_001"}]
2:[{"type":"progress","label":"summary","status":"complete","order":2,"message":"Analysis Complete"}]

# Context files selected (when contextOptimization=true):
2:[{"type":"progress","label":"context","status":"in-progress","order":3,"message":"Determining Files to Read"}]
2:[{"type":"codeContext","files":["/src/main.tsx","/package.json"]}]
2:[{"type":"progress","label":"context","status":"complete","order":4,"message":"Code Files Selected"}]

# Token usage (at end):
2:[{"type":"usage","value":{"completionTokens":250,"promptTokens":1500,"totalTokens":1750}}]
```

**Error responses:**

```
HTTP 401 — bad API key:
{"error":true,"message":"Invalid or missing API key","statusCode":401,"isRetryable":false,"provider":"OpenAI"}

HTTP 500 — general error:
{"error":true,"message":"An unexpected error occurred","statusCode":500,"isRetryable":true,"provider":"unknown"}
```

---

## 14. Prompt Enhancer — `/api/enhancer`

Takes a raw user prompt and returns an improved, more specific version.

```
POST /api/enhancer
Content-Type: application/json
Cookie: apiKeys=<url_encoded_keys>
```

**Request body:**
```json
{
  "message": "build a todo app",
  "model": "gpt-4o",
  "provider": {
    "name": "OpenAI",
    "staticModels": [],
    "getApiKeyLink": "https://platform.openai.com/api-keys",
    "labelForGetApiKey": "Get OpenAI API Key",
    "icon": "i-simple-icons-openai"
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `message` | **Yes** | The prompt text to enhance |
| `model` | **Yes** | Model ID string (e.g. `"gpt-4o"`) |
| `provider` | **Yes** | Provider object — only `name` is used internally |

**200 — streaming plain text:**

```
Content-Type: text/event-stream
```

Stream of text chunks containing the enhanced prompt.

**400:** `Invalid or missing model`  
**401:** `Invalid or missing API key`

---

## 15. Direct LLM Call — `/api/llmcall`

Single-turn LLM call, optionally streamed.

```
POST /api/llmcall
Content-Type: application/json
Cookie: apiKeys=<url_encoded_keys>
```

**Request body:**
```json
{
  "system": "You are a senior software engineer. Review the code and provide detailed feedback.",
  "message": "Review this function:\n\nfunction add(a, b) { return a + b; }",
  "model": "claude-3-5-sonnet-20241022",
  "provider": {
    "name": "Anthropic",
    "staticModels": [],
    "getApiKeyLink": "https://console.anthropic.com/settings/keys"
  },
  "streamOutput": false
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `system` | **Yes** | System prompt |
| `message` | **Yes** | User message |
| `model` | **Yes** | Model ID |
| `provider` | **Yes** | Provider object with `name` field |
| `streamOutput` | No | `true` for SSE stream, `false` for JSON (default: `false`) |

**200 — non-streaming:**
```json
{
  "text": "The function looks clean. Consider adding type annotations: function add(a: number, b: number): number {...}",
  "usage": {
    "promptTokens": 45,
    "completionTokens": 120,
    "totalTokens": 165
  }
}
```

**200 — streaming** (`streamOutput: true`): `text/event-stream` with text chunks.

---

## 16. Models & Providers — `/api/models`

### Get all models and providers

```
GET /api/models
Cookie: apiKeys=<url_encoded_keys>   [optional — enables dynamic model fetching]
```

**200:**
```json
{
  "modelList": [
    {
      "name": "gpt-4o",
      "label": "GPT-4o",
      "provider": "OpenAI",
      "maxTokenAllowed": 128000,
      "maxCompletionTokens": 4096
    },
    {
      "name": "claude-3-5-sonnet-20241022",
      "label": "Claude 3.5 Sonnet",
      "provider": "Anthropic",
      "maxTokenAllowed": 200000,
      "maxCompletionTokens": 128000
    }
  ],
  "providers": [
    {
      "name": "OpenAI",
      "staticModels": [ ...array of ModelInfo... ],
      "getApiKeyLink": "https://platform.openai.com/api-keys",
      "labelForGetApiKey": "Get OpenAI API Key",
      "icon": "i-simple-icons-openai"
    }
  ],
  "defaultProvider": {
    "name": "Anthropic",
    "staticModels": [ ... ]
  }
}
```

---

### Get models for one provider

```
GET /api/models/OpenAI
GET /api/models/Anthropic
GET /api/models/Groq
GET /api/models/Ollama
GET /api/models/OpenRouter
Cookie: apiKeys=<url_encoded_keys>
```

Same response shape as above, but `modelList` contains only models for that provider.

**Valid provider names:** `OpenAI` · `Anthropic` · `Google` · `Groq` · `Deepseek` · `xAI` · `Mistral` · `Cohere` · `Together` · `Fireworks` · `Hyperbolic` · `Cerebras` · `Moonshot` · `Perplexity` · `OpenRouter` · `AmazonBedrock` · `Github` · `Z.ai` · `Ollama` · `LMStudio` · `HuggingFace`

---

## 17. Configured Providers — `/api/configured-providers`

Returns which providers have API keys set **in server environment variables** (not cookies).

```
GET /api/configured-providers
```

**200:**
```json
{
  "providers": [
    { "name": "Ollama",   "isConfigured": true,  "configMethod": "environment" },
    { "name": "LMStudio", "isConfigured": false, "configMethod": "none" }
  ]
}
```

---

## 18. Check Env Key — `/api/check-env-key`

Check whether a specific provider's API key is available (from any source).

```
GET /api/check-env-key?provider=OpenAI
Cookie: apiKeys=<url_encoded_keys>; __bolt_session=<session>
```

| Query param | Required | Description |
|-------------|----------|-------------|
| `provider` | **Yes** | Provider name (e.g. `OpenAI`, `Anthropic`) |

**200:**
```json
{ "isSet": true }
```

---

## 19. Export API Keys — `/api/export-api-keys`

Returns all API keys visible to the current request (merging cookies + environment).

```
GET /api/export-api-keys
Cookie: apiKeys=<url_encoded_keys>
```

**200:**
```json
{
  "OpenAI": "sk-proj-...",
  "Anthropic": "sk-ant-api03-...",
  "Google": "AIzaSy..."
}
```

---

## 20. GitHub Integration

### Get repository branches

```
GET  /api/github-branches?owner=octocat&repo=Hello-World
POST /api/github-branches
```

**GET** reads token from `apiKeys` cookie (`GITHUB_API_KEY` or `VITE_GITHUB_ACCESS_TOKEN`).

**POST body:**
```json
{
  "owner": "octocat",
  "repo": "Hello-World",
  "token": "github_pat_11AAABBB..."
}
```

**200:**
```json
{
  "branches": [
    { "name": "main",           "sha": "abc123...", "protected": true,  "isDefault": true  },
    { "name": "feature/my-feat","sha": "def456...", "protected": false, "isDefault": false }
  ],
  "defaultBranch": "main",
  "total": 2
}
```

---

### Get authenticated GitHub user

```
GET  /api/github-user
POST /api/github-user
```

**POST body:**
```json
{ "token": "github_pat_11AAABBB..." }
```

**200:**
```json
{
  "login": "octocat",
  "name": "The Octocat",
  "email": "octocat@github.com",
  "avatar_url": "https://github.com/images/error/octocat_happy.gif",
  "public_repos": 100,
  "followers": 500
}
```

---

### Get repository template files

```
GET  /api/github-template
POST /api/github-template
```

**POST body:**
```json
{
  "owner": "octocat",
  "repo": "my-template-repo",
  "branch": "main",
  "token": "github_pat_11AAABBB..."
}
```

**200:**
```json
{
  "files": {
    "package.json": "{\"name\":\"template\"}",
    "src/index.ts":  "console.log('hello');"
  }
}
```

---

### Get repository statistics

```
GET  /api/github-stats
POST /api/github-stats
```

**POST body:**
```json
{
  "owner": "octocat",
  "repo": "Hello-World",
  "token": "github_pat_11AAABBB..."
}
```

**200:**
```json
{
  "stars": 1234,
  "forks": 567,
  "issues": 89,
  "watchers": 234,
  "language": "TypeScript",
  "description": "My awesome repo",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## 21. GitLab Integration

### Get GitLab branches

```
GET  /api/gitlab-branches
POST /api/gitlab-branches
```

**GET** reads token from `apiKeys` cookie (`VITE_GITLAB_ACCESS_TOKEN`).

**POST body:**
```json
{
  "projectId": "12345",
  "token": "glpat-xxxxxxxxxxxxxxxxxxxx"
}
```

**200:**
```json
{
  "branches": [
    {
      "name": "main",
      "commit": { "id": "abc123" },
      "default": true,
      "protected": true
    }
  ]
}
```

---

### Get GitLab projects

```
GET  /api/gitlab-projects
POST /api/gitlab-projects
```

**POST body:**
```json
{ "token": "glpat-xxxxxxxxxxxxxxxxxxxx" }
```

**200:**
```json
{
  "projects": [
    {
      "id": 12345,
      "name": "my-project",
      "path_with_namespace": "username/my-project",
      "default_branch": "main",
      "web_url": "https://gitlab.com/username/my-project"
    }
  ]
}
```

---

## 22. Vercel Deployment — `/api/vercel-deploy`

### Deploy files to Vercel

```
POST /api/vercel-deploy
Content-Type: application/json
```

**Full request body:**
```json
{
  "projectName": "my-react-app",
  "files": {
    "package.json":    "{\"name\":\"my-react-app\",\"scripts\":{\"build\":\"vite build\",\"dev\":\"vite\"}}",
    "index.html":      "<!DOCTYPE html><html>...</html>",
    "src/main.tsx":    "import React from 'react'; ...",
    "vite.config.ts":  "import { defineConfig } from 'vite'; ..."
  },
  "token":            "your_vercel_access_token",
  "projectId":        "prj_xxxxxxxxxxxx",
  "teamId":           "team_xxxxxxxxxxxx",
  "framework":        "vite",
  "buildCommand":     "npm run build",
  "outputDirectory":  "dist",
  "installCommand":   "npm install",
  "envVars": {
    "VITE_API_URL": "https://api.example.com"
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `projectName` | **Yes** | Name for the Vercel project |
| `files` | **Yes** | Map of `"path"` → `"file content string"` |
| `token` | **Yes** | Vercel personal access token |
| `projectId` | No | Existing project ID (update vs. create) |
| `teamId` | No | Vercel team ID |
| `framework` | No | Auto-detected or `"nextjs"` · `"vite"` · `"remix"` · `"create-react-app"` · `"nuxt"` |
| `buildCommand` | No | Overrides auto-detected build command |
| `outputDirectory` | No | Overrides auto-detected output dir |
| `installCommand` | No | Override install command |
| `envVars` | No | Environment variables for the deployment |

**200:**
```json
{
  "url":        "https://my-react-app-xxxx.vercel.app",
  "deploymentId": "dpl_xxxxxxxxxxxx",
  "projectId":  "prj_xxxxxxxxxxxx",
  "projectName":"my-react-app",
  "teamId":     null,
  "readyState": "READY"
}
```

---

### Get Vercel user info

```
GET  /api/vercel-user
POST /api/vercel-user
```

**POST body:**
```json
{ "token": "your_vercel_access_token" }
```

**200:**
```json
{
  "user": {
    "uid": "xxxxxxxxxxxx",
    "email": "user@example.com",
    "name": "John Doe",
    "username": "johndoe"
  },
  "teams": [
    { "id": "team_xxx", "name": "My Team", "slug": "my-team" }
  ]
}
```

---

## 23. Netlify Deployment — `/api/netlify-deploy`

### Deploy files to Netlify

```
POST /api/netlify-deploy
Content-Type: application/json
```

**Full request body:**
```json
{
  "siteId":   "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "siteName": "my-react-app",
  "files": {
    "index.html":  "<!DOCTYPE html>...",
    "src/main.js": "console.log('hello');",
    "styles.css":  "body { margin: 0; }"
  },
  "token": "your_netlify_personal_access_token"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `files` | **Yes** | Map of `"path"` → `"file content string"` |
| `token` | **Yes** | Netlify personal access token |
| `siteId` | No | Existing site ID (creates new site if omitted) |
| `siteName` | No | Name for new site |

**200:**
```json
{
  "deploy_id":  "xxxxxxxxxxxxxxxxxxxx",
  "site_id":    "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "url":        "https://my-react-app.netlify.app",
  "deploy_url": "https://deploy-preview-123--my-react-app.netlify.app",
  "state":      "ready",
  "claimed":    true,
  "site_name":  "my-react-app"
}
```

---

### Get Netlify user info

```
GET  /api/netlify-user
POST /api/netlify-user
```

**POST body:**
```json
{ "token": "your_netlify_personal_access_token" }
```

**200:**
```json
{
  "user": {
    "id": "xxxxxxxxxxxx",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://..."
  },
  "sites": [
    {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "name": "my-react-app",
      "url":  "https://my-react-app.netlify.app",
      "state": "current"
    }
  ]
}
```

---

## 24. Supabase Integration

### Connect Supabase / list projects

```
POST /api/supabase
Content-Type: application/json
```

```json
{ "token": "your_supabase_personal_access_token" }
```

**200:**
```json
{
  "user": { "email": "Connected", "role": "Admin" },
  "stats": {
    "projects": [
      {
        "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "name": "My Supabase Project",
        "organization_id": "...",
        "region": "us-east-1",
        "status": "ACTIVE_HEALTHY",
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "totalProjects": 1
  }
}
```

---

### Get Supabase projects (alternate endpoint)

```
GET  /api/supabase-user
POST /api/supabase-user
```

**POST body:**
```json
{ "token": "your_supabase_personal_access_token" }
```

**200:**
```json
{
  "projects": [
    { "id": "xxx...", "name": "My Project", "region": "us-east-1" }
  ]
}
```

---

### Execute a Supabase SQL query

```
POST /api/supabase.query
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

```json
{
  "projectId": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "query": "SELECT id, email, created_at FROM auth.users LIMIT 10;"
}
```

**200:**
```json
[
  { "id": "uuid-1", "email": "user@example.com", "created_at": "2024-01-01T00:00:00Z" }
]
```

**401:** `No authorization token provided`

---

### Get Supabase project env variables

```
POST /api/supabase.variables
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

```json
{ "projectId": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
```

**200:**
```json
{
  "anonKey":     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "supabaseUrl": "https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.supabase.co"
}
```

---

## 25. Web Search — `/api/web-search`

Fetches a public URL and extracts its text content (max 8 000 characters) for use as LLM context.

```
POST /api/web-search
Content-Type: application/json
```

```json
{ "url": "https://docs.react.dev/learn" }
```

**200:**
```json
{
  "success": true,
  "data": {
    "title":       "Quick Start – React",
    "description": "Welcome to the React documentation!",
    "content":     "Quick Start\nWelcome to the React documentation!...",
    "sourceUrl":   "https://docs.react.dev/learn"
  }
}
```

**400:**
```json
{ "error": "URL is required" }
{ "error": "URL is not allowed. Only public HTTP/HTTPS URLs are accepted." }
```

---

## 26. Git Proxy — `/api/git-proxy/*`

Proxies git HTTP smart-protocol requests from the in-browser WebContainer to remote git servers (avoids CORS restrictions).

```
POST /api/git-proxy/https://github.com/octocat/Hello-World.git/info/refs?service=git-upload-pack
POST /api/git-proxy/https://github.com/octocat/Hello-World.git/git-upload-pack
```

The wildcard path contains the full remote URL. Raw git protocol binary payloads are passed through unchanged.

---

## 27. System & Diagnostics

### Health check

```
GET /api/health
```

**200:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### Full system diagnostics

```
GET /api/system.diagnostics
```

**200:**
```json
{
  "status": "success",
  "environment": {
    "hasGithubToken": false,
    "hasNetlifyToken": false,
    "nodeEnv": "production"
  },
  "cookies": {
    "hasGithubTokenCookie": false,
    "hasGithubUsernameCookie": false,
    "hasNetlifyCookie": false
  },
  "localStorage": {
    "explanation": "Local storage can only be checked on the client side.",
    "githubKeysToCheck": ["github_connection"],
    "netlifyKeysToCheck": ["netlify_connection"]
  },
  "externalApis": {
    "github":  { "isReachable": true,  "status": 200 },
    "netlify": { "isReachable": true,  "status": 200 }
  },
  "corsStatus": {
    "headers": {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  },
  "technicalDetails": {
    "serverTimestamp": "2024-01-15T10:30:00.000Z",
    "userAgent": "Mozilla/5.0 ...",
    "host":      "localhost:5173",
    "method":    "GET",
    "url":       "http://localhost:5173/api/system.diagnostics"
  }
}
```

---

### Disk usage

```
GET /api/system.disk-info
```

**200:**
```json
{
  "total": 107374182400,
  "used":  53687091200,
  "free":  53687091200,
  "usedPercent": 50
}
```

---

### Git repository info

```
GET /api/system.git-info
GET /api/git-info
```

**200:**
```json
{
  "commitHash": "abc123def456",
  "branch":     "main",
  "tag":        "v1.2.3",
  "isClean":    true,
  "remoteUrl":  "https://github.com/stackblitz-labs/bolt.diy"
}
```

---

## 28. MCP (Model Context Protocol)

### Check MCP server status

```
GET /api/mcp-check
```

**200:**
```json
[
  {
    "name":   "filesystem",
    "status": "connected",
    "tools":  ["read_file", "write_file", "list_directory"]
  }
]
```

---

### Update MCP configuration

```
POST /api/mcp-update-config
Content-Type: application/json
```

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/project"],
      "env": {}
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "github_pat_..." }
    }
  }
}
```

**200:** Array of server tool descriptions after applying the new config.

---

## 29. App Update — `/api/update`

### Check for updates

```
GET /api/update
```

**200:**
```json
{
  "available":      true,
  "currentVersion": "1.2.3",
  "latestVersion":  "1.3.0",
  "releaseUrl":     "https://github.com/stackblitz-labs/bolt.diy/releases/tag/v1.3.0"
}
```

---

### Trigger update (server environment)

```
POST /api/update
Content-Type: application/json
```

No body required.

**400:**
```json
{
  "error": "Updates must be performed manually in a server environment",
  "instructions": [
    "1. Navigate to the project directory",
    "2. Run: git fetch upstream",
    "3. Run: git pull upstream main",
    "4. Run: pnpm install",
    "5. Run: pnpm run build"
  ]
}
```

---

## 30. Bug Report — `/api/bug-report`

Rate limited: 5 reports per IP per hour.  
Requires `GITHUB_BUG_REPORT_TOKEN` server env var to create GitHub issues.

```
POST /api/bug-report
Content-Type: multipart/form-data
```

**Form fields:**

| Field | Type | Required | Max length |
|-------|------|----------|-----------|
| `title` | string | **Yes** | 100 chars |
| `description` | string | **Yes** | 2 000 chars |
| `stepsToReproduce` | string | No | 1 000 chars |
| `expectedBehavior` | string | No | 1 000 chars |
| `contactEmail` | string (email) | No | — |
| `includeEnvironmentInfo` | `"true"` / `"false"` | No | — |
| `environmentInfo` | JSON string | No | See below |

**`environmentInfo` JSON string structure:**
```json
{
  "browser":          "Chrome 120",
  "os":               "macOS 14.2",
  "screenResolution": "2560x1440",
  "boltVersion":      "1.2.3",
  "aiProviders":      "OpenAI, Anthropic",
  "projectType":      "React",
  "currentModel":     "gpt-4o"
}
```

**200:**
```json
{
  "success":     true,
  "issueNumber": 1234,
  "issueUrl":    "https://github.com/stackblitz-labs/bolt.diy/issues/1234",
  "message":     "Bug report submitted successfully!"
}
```

**400 — validation error:**
```json
{
  "error": "Invalid input data",
  "details": [
    { "path": ["title"], "message": "Title is required" }
  ]
}
```

**429 — rate limited:**
```json
{ "error": "Rate limit exceeded. Please wait before submitting another report." }
```

---

## 31. Health Check — `/api/health`

```
GET /api/health
```

**200:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 32. Error Reference

### Standard error shape

```json
{ "error": "Human-readable message" }
```

### HTTP status codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Bad Request — missing or invalid fields |
| `401` | Unauthorized — missing/invalid API key or session |
| `403` | Forbidden |
| `404` | Not Found |
| `405` | Method Not Allowed |
| `429` | Rate Limited |
| `500` | Internal Server Error |
| `502` | Bad Gateway — upstream service error |
| `503` | Service Unavailable |
| `504` | Gateway Timeout |

### Common error messages

| Message | Cause | Fix |
|---------|-------|-----|
| `"Invalid or missing API key"` | No API key found | Add key in Settings or `apiKeys` cookie |
| `"Invalid model selected"` | Model name wrong | Use exact model ID from Section 3 |
| `"Token limit exceeded"` | Conversation too long | Start new chat or pick larger-context model |
| `"API rate limit exceeded"` | Too many requests | Wait and retry |
| `"Unauthorized"` | Not logged in | Log in via `/auth/google` |
| `"projectId required"` | Missing field in POST | Include `projectId` in request body |
| `"path required"` | Missing file path | Include `path` in request body |

---

## Quick Reference — All Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/auth/google` | — | Start Google OAuth |
| GET | `/auth/google.callback` | — | OAuth callback |
| GET | `/auth/logout` | session | Logout |
| GET | `/api/me` | session | Get current user |
| GET | `/api/user-settings` | session | Get saved API keys |
| POST | `/api/user-settings` | session | Save API keys |
| GET | `/api/projects` | session | List projects |
| POST | `/api/projects` | session | Create / update project |
| GET | `/api/chats` | session | List chats |
| POST | `/api/chats` | session | Create / update / delete chat |
| GET | `/api/chat-history` | session | List chats or get full chat |
| POST | `/api/chat-history` | session | Save full chat history |
| GET | `/api/messages` | session | List messages |
| POST | `/api/messages` | session | Append messages |
| GET | `/api/files` | session | List project files |
| POST | `/api/files` | session | Upsert / delete file |
| GET | `/api/file-versions` | session | File version history |
| POST | `/api/file-versions` | session | Restore file version |
| GET | `/api/activity-logs` | session | Activity logs |
| POST | `/api/chat` | apiKeys | **AI streaming chat** |
| POST | `/api/enhancer` | apiKeys | Enhance a prompt |
| POST | `/api/llmcall` | apiKeys | Direct LLM call |
| GET | `/api/models` | — | All models & providers |
| GET | `/api/models/:provider` | — | Models for one provider |
| GET | `/api/configured-providers` | — | Env-configured providers |
| GET | `/api/check-env-key` | — | Check API key presence |
| GET | `/api/export-api-keys` | — | Export API keys |
| GET/POST | `/api/github-branches` | — | GitHub repo branches |
| GET/POST | `/api/github-user` | — | GitHub user info |
| GET/POST | `/api/github-template` | — | GitHub repo template |
| GET/POST | `/api/github-stats` | — | GitHub repo stats |
| GET/POST | `/api/gitlab-branches` | — | GitLab branches |
| GET/POST | `/api/gitlab-projects` | — | GitLab projects |
| POST | `/api/vercel-deploy` | — | Deploy to Vercel |
| GET/POST | `/api/vercel-user` | — | Vercel user info |
| POST | `/api/netlify-deploy` | — | Deploy to Netlify |
| GET/POST | `/api/netlify-user` | — | Netlify user info |
| POST | `/api/supabase` | — | Supabase connect |
| GET/POST | `/api/supabase-user` | — | Supabase projects |
| POST | `/api/supabase.query` | Bearer token | Execute SQL query |
| POST | `/api/supabase.variables` | Bearer token | Get env vars |
| POST | `/api/web-search` | — | Fetch & parse URL |
| POST | `/api/git-proxy/*` | — | Git HTTP proxy |
| GET | `/api/health` | — | Health check |
| GET | `/api/system.diagnostics` | — | System diagnostics |
| GET | `/api/system.disk-info` | — | Disk usage |
| GET | `/api/system.git-info` | — | Git repo info |
| GET | `/api/git-info` | — | Git info (legacy) |
| GET | `/api/mcp-check` | — | MCP server status |
| POST | `/api/mcp-update-config` | — | Update MCP config |
| GET | `/api/update` | — | Check for updates |
| POST | `/api/update` | — | Manual update instructions |
| POST | `/api/bug-report` | — | Submit bug report |

---

*Generated from source: `app/routes/api.*.ts` · `app/lib/modules/llm/providers/*.ts`*
