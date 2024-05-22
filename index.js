const puppeteer = require('puppeteer');
const axios = require('axios');
const faker = require('faker');

// Discord webhook URL
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1242966431046303825/C-JqqTlORHV83RmZ2azF18V5EkIdu0dZZanvdrjHMywo20lSC7L6y_zK0s2hk6utyi6x';

// Function to send a message to Discord
async function sendToDiscord(message) {
    try {
        const response = await axios.post(DISCORD_WEBHOOK_URL, {
            content: message
        });
        if (response.status === 204) {
            console.log("Message sent successfully to Discord");
        }
    } catch (error) {
        console.error("Failed to send message to Discord", error);
    }
}

// Function to generate a random email and password
function generateRandomCredentials() {
    const email = `${faker.internet.userName()}@gmail.com`;

    // Generate a compliant password
    const upper = faker.random.alpha({ count: 1, upcase: true });
    const lower = faker.random.alpha({ count: 1, upcase: false });
    const number = faker.random.numeric(1);
    const symbol = faker.random.arrayElement(['!', '@', '#', '$', '%', '^', '&', '*', '(', ')']);
    const remaining = faker.random.alphaNumeric(6);
    const password = faker.random.arrayElement([upper, lower, number, symbol, remaining]).join('');

    return { email, password: `${upper}${lower}${number}${symbol}${remaining}` };
}

(async () => {
    const { email, password } = generateRandomCredentials();
    console.log(`Generated Email: ${email}`);
    console.log(`Generated Password: ${password}`);

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // Step 1: Create a TikTok account
        await page.goto('https://www.tiktok.com/signup', { waitUntil: 'networkidle2' });

        // Simulate account creation steps (example for email signup)
        // Note: Adjust selectors as needed based on TikTok's actual signup process
        await page.type('input[name="email"]', email);
        await page.type('input[name="password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Step 2: Navigate to the live stream
        await page.goto('https://www.tiktok.com/@generalalexmc/live', { waitUntil: 'networkidle2' });

        // Step 3: Watch the live stream for 3 minutes
        await page.waitForTimeout(180000);

        // Step 4: Extract the reward code (adjust selector based on actual element containing the code)
        // For demonstration purposes, let's assume the code appears in an element with id 'reward-code'
        try {
            const rewardCodeElement = await page.$('#reward-code');
            const rewardCode = await page.evaluate(el => el.textContent, rewardCodeElement);
            console.log(`Reward Code: ${rewardCode}`);

            // Step 5: Send the reward code to Discord
            await sendToDiscord(`Reward Code: ${rewardCode}`);
        } catch (error) {
            console.error("Failed to retrieve the reward code:", error);
        }
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        // Close the browser
        await browser.close();
    }
})();
