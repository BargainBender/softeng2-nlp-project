const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(stealthPlugin());

async function extractItems(page) {
    const reviews = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".jftiEf")).map((el) => {
            const reviewText = el.querySelector(".wiI7pd")?.textContent.trim();
            if (!reviewText) {
                return null; // Skip this review if reviewText is empty or null
            }

            return {
                user: {
                    name: el.querySelector(".d4r55")?.textContent.trim(),
                    thumbnail: el.querySelector("a.WEBjve img")?.getAttribute("src"),
                    localGuide: el.querySelector(".RfnDt span:nth-child(1)")?.style.display === "none" ? false : true,
                    reviews: el.querySelector(".RfnDt span:nth-child(2)")?.textContent.replace("·", "").replace("reviews", "").trim(),
                    link: el.querySelector("a.WEBjve")?.getAttribute("href"),
                },
                rating: el.querySelector(".kvMYJc")?.getAttribute("aria-label").trim(),
                date: el.querySelector(".rsqaWe")?.textContent,
                review: reviewText,
            };
        });
    });
    return reviews;
}

const clickButtons = async (page) => {
    await page.$$eval('.w8nwRe.kyuRq', (buttons) => {
        buttons.forEach((button) => button.click());
    });
}

const scrollPage = async (page, scrollContainer, itemTargetCount) => {
    let items = [];
    let previousHeight = await page.evaluate((scrollContainer) => {
        return document.querySelector(scrollContainer).scrollHeight;
    }, scrollContainer);

    while (itemTargetCount > items.length) {
        await clickButtons(page);
        items = await extractItems(page);
        await page.evaluate((scrollContainer) => {
            document.querySelector(scrollContainer).scrollTo(0, document.querySelector(scrollContainer).scrollHeight);
        }, scrollContainer);
        let newHeight = await page.evaluate((scrollContainer) => {
            return document.querySelector(scrollContainer).scrollHeight;
        }, scrollContainer);
        if (newHeight === previousHeight) {
            break; // Break the loop if the scroll height did not change
        }
        previousHeight = newHeight;
        await new Promise(r => setTimeout(r, 3000)); 
        await clickButtons(page);
    }
    return items;
}

const getMapsData = async (urlVar) => {
    try {
        let url = urlVar;
        browser = await puppeteer.launch({
            args: ["--disabled-setuid-sandbox", "--no-sandbox", "--disable-gpu"],
            headless: true,
            ignoreHTTPSErrors: true,
        });
        const [page] = await browser.pages();

        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
        await new Promise(r => setTimeout(r, 9000));

        let ratings = await page.evaluate(() => {
            return Array.from(document.querySelectorAll(".PPCwl")).map((el) => {
                return {
                    avg_rating: el.querySelector(".fontDisplayLarge")?.textContent.trim(),
                    total_reviews: el.querySelector(".fontBodySmall")?.textContent.trim(),
                    five_stars: el.querySelector(".ExlQHd tbody tr:nth-child(1)").getAttribute("aria-label").split("stars, ")[1].trim(),
                    four_stars: el.querySelector(".ExlQHd tbody tr:nth-child(2)").getAttribute("aria-label").split("stars, ")[1].trim(),
                    three_stars: el.querySelector(".ExlQHd tbody tr:nth-child(3)").getAttribute("aria-label").split("stars, ")[1].trim(),
                    two_stars: el.querySelector(".ExlQHd tbody tr:nth-child(4)").getAttribute("aria-label").split("stars, ")[1].trim(),
                    one_stars: el.querySelector(".ExlQHd tbody tr:nth-child(5)").getAttribute("aria-label").split("stars, ")[1].trim(),
                };
            });
        });

        let data = await scrollPage(page, '.DxyBCb', parseInt(ratings[0].total_reviews.replace(/[^0-9\.]+/g, ""), 10) / 2);
        let jsonData = JSON.stringify(data);

        console.log(jsonData);
        await browser.close();
    } catch (e) {
        console.log(e);
    }
};

module.exports = getMapsData;
