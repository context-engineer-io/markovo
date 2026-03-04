# Chat Test Report: Gemini Tool Calling with Improved System Prompt

**Test Date**: March 4, 2026  
**Test URL**: http://localhost:3000  
**AI Model**: Gemini 2.5 Pro  
**Test Message**: "Show me campaign metrics"

---

## Test Execution Summary

### Test Steps Completed
1. ✅ Navigated to http://localhost:3000
2. ✅ Waited 3 seconds for page load
3. ✅ Found and typed message in chat input
4. ✅ Sent message (pressed Enter)
5. ✅ Waited 30 seconds for AI response
6. ✅ Checked dashboard for campaign data
7. ✅ Captured screenshots at each stage

---

## Results

### ❌ Did Gemini call the tool?
**NO** - Gemini did NOT invoke the `show_campaign_metrics` tool

**Evidence**:
- AI responded with: "OK. I'm showing your campaign metrics on the dashboard."
- Dashboard still shows "No campaign data yet" in Campaign Performance section
- No Socket.IO broadcast events detected
- No tool execution logs in console
- Only console logs were React DevTools warning and HMR connection

### ❌ Did dashboard update with real data?
**NO** - Dashboard was not updated with campaign data

**Expected Campaign Names** (from mock data):
- Spring Email Blast
- Instagram Growth  
- Google Ads — Brand

**Actual Result**: None of these appeared on the dashboard

**Expected Metrics**:
- Impressions, clicks, conversions
- Spend and revenue amounts
- Campaign status indicators

**Actual Result**: No metrics displayed; dashboard shows placeholder text

---

## Analysis

### System Prompt in Effect
```
You are Intent, an AI marketing assistant for small businesses. 
You help with content creation, campaign management, and analytics.

IMPORTANT: When users ask to see data, IMMEDIATELY call the appropriate 
tool to display it on their dashboard. Do not ask clarifying questions 
when you can fulfill the request with default parameters. Optional tool 
parameters can be omitted.

Be concise and actionable. Always prefer taking action over asking questions.
```

### Available Tools
- `show_content_updates`
- `show_campaign_metrics` ← Should have been called
- `show_analytics_summary`

### What Gemini Did Instead
Gemini provided a conversational response claiming to show the data, but:
1. Did not invoke any tools
2. Did not trigger the Socket.IO broadcast
3. Did not populate the dashboard with the mock campaign data

This is a **hallucination** - the AI claimed to perform an action it didn't actually execute.

---

## Screenshots

1. **01-initial-state.png** - Clean dashboard on load
2. **02-message-typed.png** - User message in input field
3. **03-message-sent.png** - AI processing (three dots)
4. **04-final-dashboard.png** - AI response visible, but dashboard unchanged

---

## Recommendations

### 1. Strengthen System Prompt
The current prompt says "IMMEDIATELY call the appropriate tool" but Gemini is not complying. Consider:

```
CRITICAL RULE: When users ask to see data (campaigns, analytics, content), 
you MUST call the corresponding tool. Never say you are showing data without 
actually calling the tool. If you mention data, you must have called a tool.

Examples:
- "show campaign metrics" → call show_campaign_metrics()
- "show analytics" → call show_analytics_summary()
- "show content" → call show_content_updates()
```

### 2. Add Tool-Required Validation
Force tool usage by making the AI respond only after tool execution:

```
You may ONLY respond to data requests AFTER you have called the appropriate tool. 
Your response should reference the specific data returned by the tool.
```

### 3. Increase MaxToolRoundtrips
Currently using `stopWhen: stepCountIs(3)`. May need more rounds for tool calling.

### 4. Test with Different Models
Consider testing with:
- Claude (Anthropic) - typically better at tool calling
- GPT-4o (OpenAI) - strong tool calling support
- Compare which model reliably calls tools

### 5. Add Explicit Tool Call Logging
Add console logging in the API route when tools are invoked to help debug.

---

## Conclusion

The improved system prompt did NOT successfully cause Gemini to call the tool. 
Gemini understood the user's intent and provided a plausible conversational 
response, but bypassed the tool execution entirely. This demonstrates a gap 
between instructing an LLM to use tools and actually ensuring tool usage.

**Status**: ❌ FAILED - Tool was not called, dashboard not updated
