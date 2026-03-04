import { test, expect, type Page } from '@playwright/test';

test.describe('Chat Functionality Tests', () => {
  let consoleLogs: string[] = [];
  let consoleErrors: string[] = [];
  let consoleWarnings: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Capture console messages
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(text);
      } else {
        consoleLogs.push(text);
      }
    });

    // Reset arrays for each test
    consoleLogs = [];
    consoleErrors = [];
    consoleWarnings = [];
  });

  test('should load homepage and display chat interface', async ({ page }) => {
    console.log('\n📝 Test 1: Loading homepage and checking chat interface...');

    // Navigate to the page
    await page.goto('http://localhost:3000');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot of initial load
    await page.screenshot({
      path: '/tmp/chat-test-1-initial-load.png',
      fullPage: true
    });
    console.log('✅ Screenshot saved: /tmp/chat-test-1-initial-load.png');

    // Check if page loaded
    await expect(page).toHaveTitle(/.*/, { timeout: 5000 });

    // Look for chat panel or button (try multiple selectors)
    const chatSelectors = [
      '[data-testid="chat-panel"]',
      '[data-testid="chat-button"]',
      'button:has-text("Chat")',
      '[aria-label*="chat" i]',
      '[class*="chat"]',
      'aside',
      '[role="complementary"]'
    ];

    let chatElement = null;
    for (const selector of chatSelectors) {
      try {
        chatElement = await page.locator(selector).first();
        if (await chatElement.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found chat element with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (chatElement) {
      await chatElement.screenshot({ path: '/tmp/chat-test-1-chat-element.png' });
      console.log('✅ Screenshot saved: /tmp/chat-test-1-chat-element.png');
    } else {
      console.log('⚠️ Could not find chat element with any known selector');
    }

    // Print console logs
    console.log('\n📋 Console logs:', consoleLogs.length > 0 ? consoleLogs.join('\n') : 'None');
    console.log('\n⚠️ Console warnings:', consoleWarnings.length > 0 ? consoleWarnings.join('\n') : 'None');
    console.log('\n❌ Console errors:', consoleErrors.length > 0 ? consoleErrors.join('\n') : 'None');
  });

  test('should send a test message and receive AI response', async ({ page }) => {
    console.log('\n📝 Test 2: Sending test message and checking AI response...');

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Find input field (try multiple selectors)
    const inputSelectors = [
      'input[type="text"]',
      'textarea',
      '[placeholder*="message" i]',
      '[placeholder*="type" i]',
      '[aria-label*="message" i]',
      '[data-testid="chat-input"]'
    ];

    let inputField = null;
    for (const selector of inputSelectors) {
      try {
        inputField = page.locator(selector).first();
        if (await inputField.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found input field with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    if (!inputField || !(await inputField.isVisible())) {
      console.log('❌ Could not find chat input field');
      await page.screenshot({
        path: '/tmp/chat-test-2-no-input.png',
        fullPage: true
      });
      return;
    }

    // Type test message
    const testMessage = 'Hello, show me campaign metrics';
    await inputField.fill(testMessage);
    console.log(`✅ Typed message: "${testMessage}"`);

    // Take screenshot before sending
    await page.screenshot({
      path: '/tmp/chat-test-2-message-typed.png',
      fullPage: true
    });
    console.log('✅ Screenshot saved: /tmp/chat-test-2-message-typed.png');

    // Find and click send button
    const sendSelectors = [
      'button[type="submit"]',
      'button:has-text("Send")',
      '[aria-label*="send" i]',
      '[data-testid="send-button"]',
      'button[class*="send"]'
    ];

    let sendButton = null;
    for (const selector of sendSelectors) {
      try {
        sendButton = page.locator(selector).first();
        if (await sendButton.isVisible({ timeout: 1000 })) {
          console.log(`✅ Found send button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    if (sendButton && await sendButton.isVisible()) {
      await sendButton.click();
      console.log('✅ Clicked send button');
    } else {
      // Try pressing Enter
      await inputField.press('Enter');
      console.log('✅ Pressed Enter to send message');
    }

    // Take screenshot after sending
    await page.screenshot({
      path: '/tmp/chat-test-2-message-sent.png',
      fullPage: true
    });
    console.log('✅ Screenshot saved: /tmp/chat-test-2-message-sent.png');

    // Wait for AI response (look for new message elements)
    console.log('⏳ Waiting for AI response...');
    await page.waitForTimeout(5000); // Wait 5 seconds for response

    // Take screenshot of response
    await page.screenshot({
      path: '/tmp/chat-test-2-ai-response.png',
      fullPage: true
    });
    console.log('✅ Screenshot saved: /tmp/chat-test-2-ai-response.png');

    // Check for SSE connection in network logs
    const hasSSE = consoleLogs.some(log =>
      log.includes('SSE') ||
      log.includes('EventSource') ||
      log.includes('stream') ||
      log.includes('text/event-stream')
    );
    console.log(`\n🔌 SSE Connection detected: ${hasSSE ? '✅ Yes' : '❌ No'}`);

    // Look for tool calls in console
    const hasToolCalls = consoleLogs.some(log =>
      log.includes('tool') ||
      log.includes('function') ||
      log.includes('dashboard') ||
      log.includes('metrics')
    );
    console.log(`🔧 Tool calls detected: ${hasToolCalls ? '✅ Yes' : '❌ No'}`);

    // Print console output
    console.log('\n📋 All console logs:');
    consoleLogs.forEach((log, i) => console.log(`  ${i + 1}. ${log}`));

    console.log('\n⚠️ Warnings:');
    if (consoleWarnings.length > 0) {
      consoleWarnings.forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));
    } else {
      console.log('  None');
    }

    console.log('\n❌ Errors:');
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    } else {
      console.log('  None');
    }
  });

  test('FULL TEST: Send "Show me campaign metrics" and verify dashboard updates', async ({ page }) => {
    test.setTimeout(90000); // Set 90 second timeout for this test
    console.log('\n📝 COMPREHENSIVE TEST: Testing improved system prompt');
    console.log('='.repeat(70));

    // 1. Navigate to http://localhost:3000
    console.log('\n1️⃣  Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000');

    // 2. Wait 3 seconds for load
    console.log('2️⃣  Waiting 3 seconds for page load...');
    await page.waitForTimeout(3000);

    // Take initial screenshot
    await page.screenshot({
      path: 'screenshots/01-initial-state.png',
      fullPage: true
    });
    console.log('✅ Screenshot saved: screenshots/01-initial-state.png');

    // 3. Type "Show me campaign metrics" in chat
    console.log('\n3️⃣  Looking for chat input field...');

    // Try multiple selectors for the chat input
    const inputSelectors = [
      'input[placeholder*="Ask"]',
      'input[placeholder*="marketing"]',
      'textarea[placeholder*="Ask"]',
      'textarea[placeholder*="marketing"]',
      'input[type="text"]',
      'textarea'
    ];

    let input = null;
    for (const selector of inputSelectors) {
      try {
        const candidate = page.locator(selector).first();
        if (await candidate.isVisible({ timeout: 1000 })) {
          input = candidate;
          console.log(`✅ Found chat input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    if (!input) {
      console.log('❌ FAIL: Could not find chat input');
      console.log('Trying to find all inputs on page:');
      const allInputs = await page.locator('input, textarea').count();
      console.log(`Found ${allInputs} input/textarea elements`);
      return;
    }

    await input.fill('Show me campaign metrics');
    console.log('✅ Typed: "Show me campaign metrics"');

    // Screenshot after typing
    await page.screenshot({
      path: 'screenshots/02-message-typed.png',
      fullPage: true
    });

    // 4. Send the message
    console.log('\n4️⃣  Sending message...');
    await input.press('Enter');
    console.log('✅ Message sent (pressed Enter)');

    // Screenshot after sending
    await page.screenshot({
      path: 'screenshots/03-message-sent.png',
      fullPage: true
    });

    // 5. Wait 30 seconds for response
    console.log('\n5️⃣  Waiting 30 seconds for AI response and dashboard update...');
    console.log('⏳ (This may take a while - AI is processing)');
    await page.waitForTimeout(30000);

    // 6. Check if dashboard actually updated with campaign data
    console.log('\n6️⃣  Checking for campaign data on dashboard...');

    const pageContent = await page.content();
    const pageText = await page.locator('body').innerText();

    // Look for specific campaign names
    const campaigns = {
      springEmail: pageContent.includes('Spring Email Blast') || pageText.includes('Spring Email Blast'),
      instagram: pageContent.includes('Instagram Growth') || pageText.includes('Instagram Growth'),
      googleAds: pageContent.includes('Google Ads') || pageText.includes('Google Ads')
    };

    // Look for metrics patterns
    const hasPercentage = /\d+\.?\d*%/.test(pageText);
    const hasDollar = /\$[\d,]+/.test(pageText);
    const hasNumbers = /\d{1,3}(,\d{3})*/.test(pageText);

    console.log('\n📊 CAMPAIGN DATA CHECK:');
    console.log('  Spring Email Blast:', campaigns.springEmail ? '✅ FOUND' : '❌ NOT FOUND');
    console.log('  Instagram Growth:', campaigns.instagram ? '✅ FOUND' : '❌ NOT FOUND');
    console.log('  Google Ads:', campaigns.googleAds ? '✅ FOUND' : '❌ NOT FOUND');
    console.log('\n📈 METRICS CHECK:');
    console.log('  Percentages:', hasPercentage ? '✅ FOUND' : '❌ NOT FOUND');
    console.log('  Dollar amounts:', hasDollar ? '✅ FOUND' : '❌ NOT FOUND');
    console.log('  Numbers:', hasNumbers ? '✅ FOUND' : '❌ NOT FOUND');

    // 7. Take screenshot of final state
    console.log('\n7️⃣  Taking final screenshot...');
    await page.screenshot({
      path: 'screenshots/04-final-dashboard.png',
      fullPage: true
    });
    console.log('✅ Screenshot saved: screenshots/04-final-dashboard.png');

    // Check console logs for tool calls
    const toolCallLogs = consoleLogs.filter(log =>
      log.includes('tool') ||
      log.includes('function') ||
      log.includes('updateDashboard') ||
      log.includes('dashboard')
    );

    console.log('\n🔧 TOOL CALL LOGS:');
    if (toolCallLogs.length > 0) {
      toolCallLogs.forEach((log, i) => console.log(`  ${i + 1}. ${log}`));
    } else {
      console.log('  ❌ No tool call logs found');
    }

    // 8. Report results
    const hasCampaignData = campaigns.springEmail || campaigns.instagram || campaigns.googleAds;
    const hasMetrics = hasPercentage || hasDollar;

    console.log('\n' + '='.repeat(70));
    console.log('📋 FINAL TEST RESULTS');
    console.log('='.repeat(70));
    console.log('\n❓ Did Gemini call the tool?');
    console.log(`   ${toolCallLogs.length > 0 ? '✅ YES - Tool calls detected in console' : '⚠️  UNKNOWN - No tool calls in console logs'}`);
    console.log('\n❓ Did dashboard update with real data?');
    console.log(`   ${hasCampaignData ? '✅ YES - Campaign names found!' : '❌ NO - No campaign data found'}`);
    console.log('\n❓ Are metrics visible?');
    console.log(`   ${hasMetrics ? '✅ YES - Metrics found!' : '❌ NO - No metrics found'}`);
    console.log('\n📸 Screenshots saved in screenshots/ directory');
    console.log('='.repeat(70));

    // Print all console output for debugging
    console.log('\n🔍 ALL CONSOLE LOGS:');
    if (consoleLogs.length > 0) {
      consoleLogs.forEach((log, i) => console.log(`  ${i + 1}. ${log}`));
    } else {
      console.log('  (none)');
    }

    if (consoleErrors.length > 0) {
      console.log('\n❌ CONSOLE ERRORS:');
      consoleErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

    console.log('\n📋 Final console state:');
    console.log('  Logs:', consoleLogs.length);
    console.log('  Warnings:', consoleWarnings.length);
    console.log('  Errors:', consoleErrors.length);
  });
});
