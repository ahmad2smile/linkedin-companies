import * as cheerio from "cheerio";
import { Page } from "puppeteer";
import { waitFor } from "../utils/utils";

const AD_SELECTOR = ".org-transparency-update__container";
const NO_AD_SELECTOR = ".org-feed-empty-sponsored-updates";

const CONDITION_ELEMENTS = ["ebook", "e-book", "whitepaper", "herunterladen", "download"];
const NEGATIVE_CONDITION_ELEMENTS = ["facebook"];

const isDownloadableAds = (content: string) => {
	const $ = cheerio.load(content);

	const adHtml = $(AD_SELECTOR).html();

	const adString = (adHtml || "").toLowerCase();

	return (
		!NEGATIVE_CONDITION_ELEMENTS.some((e) => adString.includes(e)) &&
		CONDITION_ELEMENTS.some((e) => adString.includes(e))
	);
};

let retires = 0;

const PAGE_WAIT_TIMEOUT = 120000;

export const gotoCompanyAds = async (page: Page, pageLink: string) => {
	try {
		await page.goto(`${pageLink}/ads`, {
			timeout: 60000,
		});

		await Promise.race([
			page.waitFor(AD_SELECTOR, { timeout: PAGE_WAIT_TIMEOUT }),
			page.waitFor(NO_AD_SELECTOR, { timeout: PAGE_WAIT_TIMEOUT }),
		]);

		const content = await page.content();

		retires = 0;

		return isDownloadableAds(content);
	} catch (error) {
		retires++;

		console.log(`error: ${error.message}`);

		if (
			retires === 5 ||
			(error.message && error.message.includes(AD_SELECTOR)) ||
			(error.message && error.message.includes(NO_AD_SELECTOR))
		) {
			return null;
		}

		console.log("Retry in 5 seconds...");

		await waitFor(5000);

		return gotoCompanyAds(page, pageLink);
	}
};
