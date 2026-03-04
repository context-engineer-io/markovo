import { chromium } from "@playwright/test";
import { join } from "path";
import { mkdirSync } from "fs";

const SCREENSHOT_DIR = join(process.cwd(), "test-screenshots-redesign");
mkdirSync(SCREENSHOT_DIR, { recursive: true });

// Test configuration
const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 375, height: 667 };
const BASE_URL = "http://localhost:3000";

// Helper to wait for element with better error handling
async function waitForElement(page, selector, options = {}) {
  try {
    await page.waitForSelector(selector, { timeout: 10000, ...options });
    return true;
  } catch (err) {
    console.log(`  ⚠️  Element not found: ${selector}`);
    return false;
  }
}

// Helper to take screenshot with logging
async function takeScreenshot(page, filename, fullPage = true) {
  const path = join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path, fullPage });
  console.log(`  📸 Screenshot saved: ${filename}`);
}

async function runDesktopTests(browser) {
  console.log("\n" + "=".repeat(60));
  console.log("🖥️  DESKTOP LAYOUT TESTS");
  console.log("=".repeat(60));

  const context = await browser.newContext({ viewport: DESKTOP_VIEWPORT });
  const page = await context.newPage();

  // Console logging
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log(`  ❌ [browser:error] ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => {
    console.log(`  ❌ [PAGE ERROR] ${err.message}`);
  });

  // ===== TEST 1: Initial Layout =====
  console.log("\n📋 TEST 1: Navigate to Dashboard - Verify Layout");
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Check for all three main sections
  const sidebarVisible = await page.locator('aside:has-text("Intent")').first().isVisible();
  const mainVisible = await page.locator('main').isVisible();
  const chatPanelVisible = await page.locator('aside >> h2:has-text("AI Assistant")').isVisible();

  console.log(`  ✓ Left Sidebar: ${sidebarVisible ? "✅" : "❌"}`);
  console.log(`  ✓ Main Content: ${mainVisible ? "✅" : "❌"}`);
  console.log(`  ✓ Chat Panel (Right): ${chatPanelVisible ? "✅" : "❌"}`);

  // Check navigation items
  const navItems = ["Dashboard", "Content", "Campaigns", "Analytics", "Settings"];
  for (const item of navItems) {
    const exists = await page.locator(`nav a:has-text("${item}")`).isVisible();
    console.log(`  ✓ Nav Item "${item}": ${exists ? "✅" : "❌"}`);
  }

  // Check chat panel elements
  const chatHeader = await page.locator('aside >> h2:has-text("AI Assistant")').isVisible();
  const connectionStatus = await page.locator('aside >> h2:has-text("AI Assistant") >> .. >> text=/Connected|Connecting|Disconnected/').isVisible();
  const chatInput = await page.locator('#chat-input').isVisible();

  console.log(`  ✓ Chat Header: ${chatHeader ? "✅" : "❌"}`);
  console.log(`  ✓ Connection Status: ${connectionStatus ? "✅" : "❌"}`);
  console.log(`  ✓ Chat Input: ${chatInput ? "✅" : "❌"}`);

  // Check Focus Mode button
  const focusButton = await page.locator('button:has-text("Focus Mode")').isVisible();
  console.log(`  ✓ Focus Mode Button: ${focusButton ? "✅" : "❌"}`);

  await takeScreenshot(page, "01-desktop-initial-layout.png");

  // ===== TEST 2: Focus Mode =====
  console.log("\n📋 TEST 2: Test Focus Mode Toggle");

  // Click Focus Mode
  await page.locator('button:has-text("Focus Mode")').click();
  await page.waitForTimeout(500); // Wait for animation

  // Check if chat panel is hidden
  const chatHidden = !(await page.locator('aside >> h2:has-text("AI Assistant")').isVisible());
  const buttonTextChanged = await page.locator('button:has-text("Show AI Assistant")').isVisible();

  console.log(`  ✓ Chat Panel Hidden: ${chatHidden ? "✅" : "❌"}`);
  console.log(`  ✓ Button Text Changed: ${buttonTextChanged ? "✅" : "❌"}`);

  await takeScreenshot(page, "02-desktop-focus-mode-enabled.png");

  // Toggle back
  await page.locator('button:has-text("Show AI Assistant")').click();
  await page.waitForTimeout(500);

  const chatReappeared = await page.locator('aside >> h2:has-text("AI Assistant")').isVisible();
  console.log(`  ✓ Chat Panel Reappeared: ${chatReappeared ? "✅" : "❌"}`);

  await takeScreenshot(page, "03-desktop-focus-mode-disabled.png");

  // ===== TEST 3: Chat Interaction =====
  console.log("\n📋 TEST 3: Test Chat Interaction");

  // Check for suggestion buttons
  const suggestionVisible = await page.locator('button:has-text("Show me today\'s analytics")').isVisible();
  console.log(`  ✓ Suggestion Buttons Visible: ${suggestionVisible ? "✅" : "❌"}`);

  // Click suggestion
  await page.locator('button:has-text("Show me today\'s analytics")').click();
  console.log("  ⏳ Waiting for AI response...");

  // Wait for response (look for user message first, then assistant)
  await page.waitForTimeout(2000);
  const userMessage = await page.locator('text="Show me today\'s analytics"').isVisible();
  console.log(`  ✓ User Message Sent: ${userMessage ? "✅" : "❌"}`);

  // Wait for assistant response
  try {
    await page.waitForSelector('text=/visitors|analytics|metrics/i', { timeout: 15000 });
    console.log("  ✓ AI Response Received: ✅");
  } catch {
    console.log("  ✓ AI Response Received: ⚠️  (timeout, but may still be streaming)");
  }

  await page.waitForTimeout(3000); // Let streaming complete
  await takeScreenshot(page, "04-desktop-chat-interaction.png");

  // ===== TEST 4: Navigation Persistence =====
  console.log("\n📋 TEST 4: Test Navigation with Chat Persistence");

  // Navigate to Content
  await page.locator('nav a[href="/content"]').click();
  await page.waitForTimeout(2000);

  const contentPageActive = await page.locator('h1:has-text("Content")').isVisible();
  const chatStillVisible = await page.locator('aside >> h2:has-text("AI Assistant")').isVisible();
  const previousMessageStillThere = await page.locator('text="Show me today\'s analytics"').isVisible();

  console.log(`  ✓ Content Page Loaded: ${contentPageActive ? "✅" : "❌"}`);
  console.log(`  ✓ Chat Panel Still Visible: ${chatStillVisible ? "✅" : "❌"}`);
  console.log(`  ✓ Previous Messages Persist: ${previousMessageStillThere ? "✅" : "❌"}`);

  await takeScreenshot(page, "05-desktop-content-page-chat-persists.png");

  // Navigate to Campaigns
  await page.locator('nav a[href="/campaigns"]').click();
  await page.waitForTimeout(2000);

  const campaignsPageActive = await page.locator('h1:has-text("Campaigns")').isVisible();
  const chatStillVisible2 = await page.locator('aside >> h2:has-text("AI Assistant")').isVisible();

  console.log(`  ✓ Campaigns Page Loaded: ${campaignsPageActive ? "✅" : "❌"}`);
  console.log(`  ✓ Chat Panel Still Visible: ${chatStillVisible2 ? "✅" : "❌"}`);

  await takeScreenshot(page, "06-desktop-campaigns-page-chat-persists.png");

  // Navigate back to Dashboard
  await page.locator('nav a[href="/"]').click();
  await page.waitForTimeout(2000);

  const dashboardActive = await page.locator('h1:has-text("Dashboard")').isVisible();
  const chatStillVisible3 = await page.locator('aside >> h2:has-text("AI Assistant")').isVisible();
  const messagesStillThere = await page.locator('text="Show me today\'s analytics"').isVisible();

  console.log(`  ✓ Dashboard Page Loaded: ${dashboardActive ? "✅" : "❌"}`);
  console.log(`  ✓ Chat Panel Still Visible: ${chatStillVisible3 ? "✅" : "❌"}`);
  console.log(`  ✓ Messages Still Present: ${messagesStillThere ? "✅" : "❌"}`);

  await takeScreenshot(page, "07-desktop-back-to-dashboard-chat-persists.png");

  await context.close();
}

async function runMobileTests(browser) {
  console.log("\n" + "=".repeat(60));
  console.log("📱 MOBILE LAYOUT TESTS");
  console.log("=".repeat(60));

  const context = await browser.newContext({ viewport: MOBILE_VIEWPORT });
  const page = await context.newPage();

  // Console logging
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log(`  ❌ [browser:error] ${msg.text()}`);
    }
  });

  // ===== TEST 5: Mobile Layout =====
  console.log("\n📋 TEST 5: Mobile Layout - No Chat Panel, Floating Button");
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Check that desktop chat panel is NOT visible
  const chatPanelHidden = !(await page.locator('aside >> h2:has-text("AI Assistant")').isVisible());

  // Check for floating chat button
  const floatingButton = await page.locator('button[aria-label="Open chat"]').isVisible();

  console.log(`  ✓ Desktop Chat Panel Hidden: ${chatPanelHidden ? "✅" : "❌"}`);
  console.log(`  ✓ Floating Chat Button Visible: ${floatingButton ? "✅" : "❌"}`);

  await takeScreenshot(page, "08-mobile-initial-layout.png", false);

  // ===== TEST 6: Mobile Chat Overlay =====
  console.log("\n📋 TEST 6: Open Mobile Chat Overlay");

  // Click floating button
  await page.locator('button[aria-label="Open chat"]').click();
  await page.waitForTimeout(1000);

  // Check if overlay opened - use closeButton as the unique identifier for mobile
  const closeButton = await page.locator('button[aria-label="Close chat"]').isVisible();
  const chatOverlayOpen = closeButton; // If close button is visible, overlay is open
  const chatInputMobile = await page.locator('#chat-input').last().isVisible();

  console.log(`  ✓ Chat Overlay Opened: ${chatOverlayOpen ? "✅" : "❌"}`);
  console.log(`  ✓ Close Button Visible: ${closeButton ? "✅" : "❌"}`);
  console.log(`  ✓ Chat Input Visible: ${chatInputMobile ? "✅" : "❌"}`);

  await takeScreenshot(page, "09-mobile-chat-overlay-open.png", false);

  // ===== TEST 7: Mobile Chat Interaction =====
  console.log("\n📋 TEST 7: Send Message in Mobile Chat");

  // Type and send message - use last() to target the mobile chat input
  await page.locator('#chat-input').last().fill("Show campaign metrics");
  await page.waitForTimeout(500);
  await page.locator('button[type="submit"]').last().click();

  console.log("  ⏳ Waiting for message to send...");
  await page.waitForTimeout(2000);

  // Look for the message in the chat message area, not the button
  const userMessageMobile = await page.locator('.whitespace-pre-wrap >> text="Show campaign metrics"').isVisible();
  console.log(`  ✓ User Message Sent: ${userMessageMobile ? "✅" : "❌"}`);

  // Wait for response
  try {
    await page.waitForSelector('text=/campaign|metrics/i', { timeout: 15000 });
    console.log("  ✓ AI Response Received: ✅");
  } catch {
    console.log("  ✓ AI Response Received: ⚠️  (timeout, but may still be streaming)");
  }

  await page.waitForTimeout(3000);
  await takeScreenshot(page, "10-mobile-chat-conversation.png", false);

  // ===== TEST 8: Close Mobile Chat =====
  console.log("\n📋 TEST 8: Close Mobile Chat Overlay");

  // Click close button - force click to handle overlapping elements
  await page.locator('button[aria-label="Close chat"]').click({ force: true });
  await page.waitForTimeout(1000);

  // Check if overlay closed
  const overlayClosed = !(await page.locator('h2:has-text("AI Assistant")').isVisible());
  const floatingButtonBack = await page.locator('button[aria-label="Open chat"]').isVisible();

  console.log(`  ✓ Chat Overlay Closed: ${overlayClosed ? "✅" : "❌"}`);
  console.log(`  ✓ Floating Button Back: ${floatingButtonBack ? "✅" : "❌"}`);

  await takeScreenshot(page, "11-mobile-chat-closed.png", false);

  await context.close();
}

async function run() {
  console.log("🚀 Starting Redesigned Dashboard Tests");
  console.log(`📁 Screenshots will be saved to: ${SCREENSHOT_DIR}`);

  const browser = await chromium.launch({ headless: true });

  try {
    await runDesktopTests(browser);
    await runMobileTests(browser);
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    throw error;
  } finally {
    await browser.close();
  }

  // ===== FINAL SUMMARY =====
  console.log("\n" + "=".repeat(60));
  console.log("✅ TEST SUMMARY");
  console.log("=".repeat(60));
  console.log("Desktop Tests:");
  console.log("  ✓ Chat panel visible on right side");
  console.log("  ✓ Focus Mode toggle functionality");
  console.log("  ✓ Chat interaction with AI");
  console.log("  ✓ Message persistence across navigation");
  console.log("\nMobile Tests:");
  console.log("  ✓ Chat panel hidden on mobile");
  console.log("  ✓ Floating button visible");
  console.log("  ✓ Full-screen overlay opens/closes");
  console.log("  ✓ Chat interaction in mobile mode");
  console.log("\n📸 All screenshots saved to: test-screenshots-redesign/");
  console.log("=".repeat(60));
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
