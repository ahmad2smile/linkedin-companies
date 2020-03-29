import { Page } from "puppeteer";
import * as cheerio from "cheerio";

import { Company } from "../entity/Company";
import { waitFor } from "../utils/utils";
import { gotoCompanyAds } from "./getCompanyDownloadAd";

const COMPANY_NAME_SELECTOR = ".org-top-card-summary__title > span";
const COMPANY_HEADER_SELECTOR = ".org-top-card-summary-info-list > div.inline-block > div:last-child";
const COMPANY_ABOUT_SELECTOR = ".break-words";
const COMPANY_DETAILS_SELECTOR = "dt.org-page-details__definition-term";
const COMPANY_LOGO_SELECTOR = ".org-top-card-primary-content__logo";

const PLACEHOLDER_LOGO = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const extractCompanyDetails = async (page: Page, pageLink: string, content: string) => {
	const $ = cheerio.load(content);

	const company = new Company();

	company.name = $(COMPANY_NAME_SELECTOR).text();

	const followersStr = $(COMPANY_HEADER_SELECTOR)
		.text()
		.replace("followers", "")
		.replace(",", "")
		.trim();
	company.followers = Number(followersStr) ?? 0;

	company.about = $(COMPANY_ABOUT_SELECTOR)?.text();

	$(COMPANY_DETAILS_SELECTOR)?.each((i, el) => {
		const detailsTitle = $(el)
			.text()
			.trim()
			.replace("Company ", "")
			.replace("headquarters", "headquarter")
			.toLowerCase();

		company[detailsTitle] = $(el.nextSibling.next)
			.text()
			.trim();
	});

	company.logo = $(COMPANY_LOGO_SELECTOR)?.attr("src") || PLACEHOLDER_LOGO;

	company.downloadableAds = await gotoCompanyAds(page, pageLink);

	return company;
};

let retires = 0;
const PAGE_WAIT_SELECTOR = COMPANY_NAME_SELECTOR;

export const getCompanyDetails = async (page: Page, pageLink: string) => {
	try {
		await page.goto(`${pageLink}/about`, {
			timeout: 60000,
		});

		await page.waitFor(PAGE_WAIT_SELECTOR, { timeout: 120000 });

		const content = await page.content();

		retires = 0;

		return extractCompanyDetails(page, pageLink, content);
	} catch (error) {
		retires++;

		console.log(`error: ${error.message}`);

		if (retires === 5 || (error.message && error.message.includes(PAGE_WAIT_SELECTOR))) {
			return null;
		}

		console.log("Retry in 5 seconds...");

		await waitFor(5000);

		return getCompanyDetails(page, pageLink);
	}
};
