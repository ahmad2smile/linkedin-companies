import { Page } from "puppeteer";
import * as cheerio from "cheerio";
import { writeFile } from "fs";

import { Company } from "../entity/Company";
import { pageLinks } from "./pageLinks";
import * as progress from "./progress.json";
import { waitFor } from "../utils/utils";

const COMPANY_LIST_SELECTOR = ".column li a";

export async function* getLinksOfCompanies(page: Page): any {
	let pageNumber = progress.linkPage;

	for (let i = progress.linkIndex; i < pageLinks.length; i++) {
		const pageLink = pageLinks[i];

		while (true) {
			const fullPageLink = `${pageLink}-${pageNumber}`;

			console.log(`Page: ${fullPageLink}`);

			const companies = await getCompanies(page, fullPageLink);

			updateProgress(i, pageNumber);

			if (!companies.length) {
				console.log(`Complete page: ${fullPageLink}`);
				pageNumber = 1;

				break;
			}

			pageNumber++;

			yield companies;
		}
	}
}

const extractCompanies = (content: any) => {
	const $ = cheerio.load(content);

	const companies: Array<Company> = [];

	$(COMPANY_LIST_SELECTOR).each(function(i) {
		const company = new Company();
		company.name = $(this).text();
		company.link = $(this).attr("href");
		companies[i] = company;
	});

	return companies;
};

let retires = 0;

const getCompanies = async (page: Page, pageLink: string) => {
	try {
		await page.goto(pageLink, {
			waitUntil: "domcontentloaded",
			timeout: 60000,
		});

		await page.waitFor("#seo-dir", { timeout: 60000 });

		const content = await page.content();

		retires = 0;

		return extractCompanies(content);
	} catch (error) {
		retires++;

		if (retires === 5 || (error.message && error.message.includes("#seo-dir"))) {
			return [];
		}

		console.log(`error: ${error.message}`);
		console.log("Retry in 5 seconds...");

		await waitFor(5000);

		return getCompanies(page, pageLink);
	}
};

const updateProgress = (i: number, pageNumber: number) => {
	const newProgress = progress;

	newProgress.linkIndex = i;
	newProgress.linkPage = pageNumber + 1;

	writeFile("./src/scrapping/progress.json", JSON.stringify(newProgress, undefined, 4), err => {
		if (err) {
			console.error("Progress Update Error");
			console.log(err);
		}
	});
};
