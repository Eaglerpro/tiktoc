// File path: /scripts/tiktok-watcher.js

const puppeteer = require('puppeteer');
const axios = require('axios');

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1242966431046303825/C-JqqTlORHV83RmZ2azF18V5EkIdu0dZZanvdrjHMywo20lSC7L6y_zK0s2hk6utyi6x';
const TIKTOK_USERNAME = 'your_generated_username';
const TIKTOK_PASSWORD = 'your_generated_password';
const TIKTOK_EMAIL = 'your_generated_email@example.com';

async function createTikTokAccount(page) {
    await page.goto('https://www.tiktok.com/signup', { waitUntil: 'networkidle2' });

    // Fill out the form
    await page.type('input[name="email"]', TIKTOK_EMAIL);
    await page.type('input[name="username"]', TIKTOK_USERNAME);
    await page.type('input[name="password"]', TIKTOK_PASSWORD);

    // Submit the form
    await page.click('button[type="submit"]');

    // Handle potential captchas or verification
    // This is simplified and may require more handling
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
}

async function watchLiveStream(page) {
    await page.goto('https://www.tiktok.com/@generalalexmc/live', { waitUntil: 'networkidle2' });

    // Watch for 3 minutes
    await page.waitForTimeout(3 * 60 * 1000);
}

async function getRewardCode(page) {
    // Simulate code extraction
    const rewardCode = await page.evaluate(() => {
        // Assuming the reward code is in a specific element
        return document.querySelector('.reward-code').innerText;
    });
    return rewardCode;
}

async function sendToDiscord(rewardCode) {
    await axios.post(DISCORD_WEBHOOK_URL, {
        content: `Reward Code: ${rewardCode}`
    });
}

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Set the user agent to mobile
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1');

    await createTikTokAccount(page);
    await watchLiveStream(page);

    const rewardCode = await getRewardCode(page);
    await sendToDiscord(rewardCode);

    await browser.close();
})();
