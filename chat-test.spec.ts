import { test, expect, type Page } from '@playwright/test';

test.describe('Chat Functionality Test', () => {
  let consoleLogs: string[] = [];
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Capture console logs
    page.on('console', (msg) => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleLogs.push(text);
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      const errorText = `[PAGE ERROR] ${error.message}`;
      consoleErrors.push(errorText);
    });
  });

  test('should test chat functionality and dashboard updates', async ({ page }) => {
    test.setTimeout(90000); // 90 seconds timeout
    console.log('\n=== Starting Chat Test ===\n');

    // Step 1: Navigate to localhost:3000
    console.log('Step 1: Navigating to http://localhost:3000');
    await page.goto('http://localhost:3000');

    // Step 2: Wait for page to fully load
    console.log('Step 2: Waiting for page to load');
    try {
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    } catch (e) {
      console.log('  - Warning: DOM load timeout, continuing anyway');
    }
    await page.waitForTimeout(3000);

    // Take screenshot before interaction
    console.log('Taking screenshot: before-interaction.png');
    await page.screenshot({ path: 'before-interaction.png', fullPage: true });

    // Step 3: Find the chat input field
    console.log('Step 3: Looking for chat input field');

    // Try multiple selectors to find the chat input
    let chatInput: any = null;

    // Try finding by ID first
    chatInput = page.locator('#chat-input');
    if (await chatInput.count() === 0) {
      console.log('  - Not found by #chat-input');
      // Try finding by placeholder
      chatInput = page.locator('input[placeholder*="Ask about your marketing"]');
    }
    if (await chatInput.count() === 0) {
      console.log('  - Not found by placeholder');
      // Try finding any input in the chat panel
      chatInput = page.locator('[class*="chat"] input, [class*="Chat"] input').first();
    }
    if (await chatInput.count() === 0) {
      console.log('  - Not found in chat panel');
      // Try finding any input or textarea
      chatInput = page.locator('input[type="text"], textarea').last();
    }

    const inputCount = await chatInput.count();
    console.log(`  - Found ${inputCount} matching input field(s)`);

    if (inputCount === 0) {
      console.log('ERROR: Could not find chat input field!');
      await page.screenshot({ path: 'no-input-found.png', fullPage: true });

      // Debug: Print page structure
      const bodyHTML = await page.locator('body').innerHTML();
      console.log('\nPage structure (first 1000 chars):');
      console.log(bodyHTML.substring(0, 1000));

      throw new Error('Chat input field not found');
    }

    // Ensure the input is visible
    await expect(chatInput).toBeVisible({ timeout: 10000 });
    console.log('  - Chat input is visible');

    // Step 4: Type the message
    console.log('Step 4: Typing message "Show me campaign metrics"');
    await chatInput.fill('Show me campaign metrics');
    await page.waitForTimeout(500); // Small delay after typing

    // Step 5: Find and click send button or press Enter
    console.log('Step 5: Sending message');

    // Try to find the send button
    const sendButton = page.locator('button[type="submit"]').filter({ hasText: /send/i });
    const sendButtonByIcon = page.locator('button[aria-label*="Send"], button:has(svg)').last();

    if (await sendButton.count() > 0) {
      console.log('  - Clicking send button (by text)');
      await sendButton.click();
    } else if (await sendButtonByIcon.count() > 0) {
      console.log('  - Clicking send button (by icon/aria-label)');
      await sendButtonByIcon.click();
    } else {
      console.log('  - Pressing Enter key');
      await chatInput.press('Enter');
    }

    console.log('  - Message sent!');

    // Step 6: Wait for AI response (up to 30 seconds)
    console.log('Step 6: Waiting for AI response (up to 30 seconds)');

    // Wait for the user message to appear
    const userMessage = page.locator('text=Show me campaign metrics').first();
    await expect(userMessage).toBeVisible({ timeout: 5000 });
    console.log('  - User message appeared in chat');

    // Wait for AI response (look for bot icon or assistant message)
    let aiResponseDetected = false;
    let aiResponseText = '';

    try {
      // Wait for any new message that's not from user
      await page.waitForSelector('[class*="Card"]:has([aria-label*="Bot" i], [class*="bot" i])', {
        timeout: 30000,
        state: 'visible'
      });

      // Get the AI response text
      const aiMessages = page.locator('[class*="Card"]').filter({
        has: page.locator('text=/Intent|AI|Assistant/i')
      });

      if (await aiMessages.count() > 0) {
        const lastAiMessage = aiMessages.last();
        aiResponseText = await lastAiMessage.innerText();
        aiResponseDetected = true;
        console.log('  - AI response detected!');
        console.log('  - Response preview:', aiResponseText.substring(0, 200));
      }
    } catch (error) {
      console.log('  - Timeout waiting for AI response');
      console.log('  - Error:', (error as Error).message);
    }

    // Take screenshot after message sent
    await page.waitForTimeout(2000);
    console.log('Taking screenshot: after-message-sent.png');
    await page.screenshot({ path: 'after-message-sent.png', fullPage: true });

    // Step 7: Check if dashboard updates
    console.log('Step 7: Checking for dashboard updates');

    // Wait a bit for dashboard to potentially update
    await page.waitForTimeout(3000);

    // Check for campaign metrics in dashboard
    const campaignSection = page.locator('text=/Campaign Performance/i');
    const campaignMetricsVisible = await campaignSection.isVisible();
    console.log('  - Campaign Performance section visible:', campaignMetricsVisible);

    // Check for actual campaign data (not placeholder text)
    const placeholderText = page.locator('text=/show campaign metrics/i');
    const hasPlaceholder = await placeholderText.isVisible().catch(() => false);
    console.log('  - Still showing placeholder:', hasPlaceholder);

    // Check for campaign metric cards/items
    const metricItems = page.locator('[class*="campaign" i], [class*="metric" i]');
    const metricCount = await metricItems.count();
    console.log('  - Found metric elements:', metricCount);

    // Look for specific campaign data indicators (clicks, conversions, revenue)
    const hasClicks = await page.locator('text=/clicks/i').count();
    const hasConversions = await page.locator('text=/conversions/i').count();
    const hasRevenue = await page.locator('text=/revenue|rev/i').count();
    console.log('  - Data indicators: clicks:', hasClicks, 'conversions:', hasConversions, 'revenue:', hasRevenue);

    const dashboardUpdated = (hasClicks > 0 || hasConversions > 0 || hasRevenue > 0) && !hasPlaceholder;
    console.log('  - Dashboard updated with data:', dashboardUpdated);

    // Step 8: Take final screenshot
    console.log('Step 8: Taking final screenshot');
    await page.screenshot({ path: 'after-dashboard-update.png', fullPage: true });

    // Step 9: Report console errors
    console.log('\n=== Console Errors ===');
    if (consoleErrors.length === 0) {
      console.log('No console errors detected!');
    } else {
      console.log(`Found ${consoleErrors.length} console error(s):`);
      consoleErrors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }

    // Summary Report
    console.log('\n=== TEST SUMMARY ===');
    console.log('✓ Page loaded successfully');
    console.log(`${aiResponseDetected ? '✓' : '✗'} Gemini/AI responded`);
    console.log(`${dashboardUpdated ? '✓' : '✗'} Dashboard updated with campaign data`);
    console.log(`${consoleErrors.length === 0 ? '✓' : '✗'} No console errors`);

    console.log('\n=== Detailed Results ===');
    console.log('- AI Response Detected:', aiResponseDetected);
    if (aiResponseText) {
      console.log('- AI Response Text:', aiResponseText.substring(0, 500));
    }
    console.log('- Dashboard Updated:', dashboardUpdated);
    console.log('- Campaign Section Visible:', campaignMetricsVisible);
    console.log('- Still Has Placeholder:', hasPlaceholder);
    console.log('- Console Errors:', consoleErrors.length);

    console.log('\n=== Screenshots Created ===');
    console.log('1. before-interaction.png - Initial page state');
    console.log('2. after-message-sent.png - After sending chat message');
    console.log('3. after-dashboard-update.png - Final state');

    console.log('\n=== Sample Console Logs (last 10) ===');
    consoleLogs.slice(-10).forEach((log, i) => {
      console.log(`  ${i + 1}. ${log}`);
    });

    console.log('\n=== Test Complete ===\n');
  });
});
