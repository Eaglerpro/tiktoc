// File path: /scripts/tiktok-watcher.js

const puppeteer = require('puppeteer');
const axios = require('axios');

const DISCORD_WEBHOOK_URL = 'YOUR_DISCORD_WEBHOOK_URL';
const TIKTOK_USERNAME = 'your_generated_username';
const TIKTOK_PASSWORD = 'your_generated_password';
const TIKTOK_EMAIL = 'your_generated_email@example.com';

async function createTikTokAccount(page) {
    try {
        await page.goto('https://www.tiktok.com/signup', { waitUntil: 'networkidle2' });

        // Fill out the form
        await page.type('input[name="email"]', TIKTOK_EMAIL);
        await page.type('input[name="username"]', TIKTOK_USERNAME);
        await page.type('input[name="password"]', TIKTOK_PASSWORD);

        // Submit the form
        await page.click('button[type="submit"]');

        // Handle potential captchas or verification
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Check for captcha
        if (await page.$('.captcha-container')) {
            console.log('Captcha detected. Please solve it manually.');
            await page.waitForSelector('.captcha-container', { visible: true });
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
        }
        
        // Verify account creation success
        if (await page.url().includes('/signup/success')) {
            console.log('Account created successfully');
        } else {
            throw new Error('Account creation failed or needs manual verification');
        }
    } catch (error) {
        console.error('Error creating TikTok account:', error);
    }
}

async function watchLiveStream(page) {
    try {
        await page.goto('https://www.tiktok.com/@generalalexmc/live', { waitUntil: 'networkidle2' });

        // Watch for 3 minutes
        await page.waitForTimeout(3 * 60 * 1000);
    } catch (error) {
        console.error('Error watching live stream:', error);
    }
}

async function getRewardCode(page) {
    try {
        // Simulate code extraction
        const rewardCode = await page.evaluate(() => {
            // Assuming the reward code is in a specific element
            const element = document.querySelector('.reward-code');
            return element ? element.innerText : null;
        });

        if (!rewardCode) {
            throw new Error('Reward code not found');
        }

        return rewardCode;
    } catch (error) {
        console.error('Error getting reward code:', error);
        return null;
    }
}

async function sendToDiscord(rewardCode) {
    try {
        await axios.post(DISCORD_WEBHOOK_URL, {
            content: `Reward Code: ${rewardCode}`
        });
    } catch (error) {
        console.error('Error sending to Discord:', error);
    }
}

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Set the user agent to mobile
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1');

    await createTikTokAccount(page);
    await watchLiveStream(page);

    const rewardCode = await getRewardCode(page);

    if (rewardCode) {
        await sendToDiscord(rewardCode);
    } else {
        console.error('Failed to retrieve reward code');
    }

    await browser.close();
})();
