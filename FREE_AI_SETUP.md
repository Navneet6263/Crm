# 🆓 Free AI APIs Setup Guide

## Quick Setup (5 minutes)

### 1. **Hugging Face** (Recommended - 30k chars/month free)

#### Step 1: Create Account
- Go to [huggingface.co](https://huggingface.co)
- Sign up with email/GitHub

#### Step 2: Get API Token
- Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
- Click "New token"
- Name: "CRM-AI-Token"
- Role: "Read"
- Copy the token (starts with `hf_`)

#### Step 3: Configure
```env
REACT_APP_AI_PROVIDER=huggingface
REACT_APP_AI_API_KEY=hf_your_token_here
```

---

### 2. **Cohere** (100 calls/month free)

#### Step 1: Create Account
- Go to [cohere.ai](https://cohere.ai)
- Sign up for free

#### Step 2: Get API Key
- Go to [Dashboard](https://dashboard.cohere.ai/api-keys)
- Copy your API key

#### Step 3: Configure
```env
REACT_APP_AI_PROVIDER=cohere
REACT_APP_AI_API_KEY=your_cohere_key_here
```

---

### 3. **Google AI Studio** (Free tier available)

#### Step 1: Create Account
- Go to [ai.google.dev](https://ai.google.dev)
- Sign in with Google account

#### Step 2: Get API Key
- Go to [Get API Key](https://makersuite.google.com/app/apikey)
- Create new API key

#### Step 3: Configure
```env
REACT_APP_AI_PROVIDER=gemini
REACT_APP_AI_API_KEY=your_gemini_key_here
```

---

## Setup Instructions

### 1. Create .env file
```bash
cp .env.example .env
```

### 2. Edit .env file
```env
# Choose one provider and add your API key
REACT_APP_AI_PROVIDER=huggingface
REACT_APP_AI_API_KEY=hf_your_actual_token_here
```

### 3. Restart your app
```bash
npm start
```

---

## Testing Your Setup

1. **Open AI Assistant** in your CRM
2. **Type**: "Generate a follow-up email"
3. **Check**: You should get AI-generated response

---

## Free Tier Limits

| Provider | Free Limit | Best For |
|----------|------------|----------|
| **Hugging Face** | 30k chars/month | General use, reliable |
| **Cohere** | 100 calls/month | Limited testing |
| **Google AI** | 60 requests/minute | High volume testing |

---

## Troubleshooting

### Common Issues:

#### 1. "API Key Invalid"
- Double-check your API key
- Make sure no extra spaces
- Restart the app after changing .env

#### 2. "Rate Limit Exceeded"
- You've hit the free limit
- Try another provider
- Wait for limit reset

#### 3. "Network Error"
- Check internet connection
- Try different provider
- Check API status pages

---

## Upgrade Path

When ready for production:

1. **OpenAI GPT-3.5/4** - Best quality responses
2. **Google Gemini Pro** - Good balance of cost/quality  
3. **Claude** - Excellent for business content

---

## Support

If you face any issues:
1. Check the browser console for errors
2. Verify your .env file configuration
3. Test with different providers
4. Check API provider status pages

**Happy coding! 🚀**