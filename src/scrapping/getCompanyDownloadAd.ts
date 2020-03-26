import * as cheerio from "cheerio";
import { Page } from "puppeteer";
import { waitFor } from "../utils/utils";

const PAGE_WAIT_SELECTOR = ".org-top-card-summary__title > span";

const AD_SELECTOR = ".org-transparency-update__container";

const CONDITION_ELEMENTS = ["ebook", "e-book", "whitepaper", "herunterladen", "download"];

const isDownloadableAds = (content: string) => {
	const $ = cheerio.load(content);

	const adHtml = $(AD_SELECTOR).html();

	const adString = (adHtml || "").toLowerCase();

	return CONDITION_ELEMENTS.some(e => adString.includes(e));
};

let retires = 0;

export const gotoCompanyAds = async (page: Page, pageLink: string) => {
	try {
		await page.goto(`${pageLink}/ads`, {
			timeout: 60000,
		});

		await page.waitFor(PAGE_WAIT_SELECTOR, { timeout: 120000 });

		const content = await page.content();

		retires = 0;

		return isDownloadableAds(content);
	} catch (error) {
		retires++;

		console.log(`error: ${error.message}`);

		if (retires === 5 || (error.message && error.message.includes(PAGE_WAIT_SELECTOR))) {
			return null;
		}

		console.log("Retry in 5 seconds...");

		await waitFor(5000);

		return gotoCompanyAds(page, pageLink);
	}
};
