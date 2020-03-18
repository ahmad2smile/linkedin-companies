import { Page } from "puppeteer";
import * as cheerio from "cheerio";
import { writeFile } from "fs";

import { Company } from "../entity/Company";
import { PageNotFoundError } from "./errors";
import { pageLinks } from "./pageLinks";
import * as progress from "./progress.json";

const COMPANY_LIST_SELECTOR = ".column li a";

const waitFor = (t: number) =>
	new Promise(resolve => {
		setTimeout(resolve, t);
	});

export async function* getLinksOfCompanies(page: Page): any {
	for (let i = progress.linkIndex; i < pageLinks.length; i++) {
		const pageLink = pageLinks[i];

		let pageNumber = progress.linkPage;

		while (true) {
			const fullPageLink = `${pageLink}-${pageNumber}`;

			console.log(`Page: ${fullPageLink}`);

			const companies = await getCompanies(page, fullPageLink);

			updateProgress(i, pageNumber);

			if (!companies.length) {
				console.log(`Complete page: ${fullPageLink}`);

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

const getCompanies = async (page: Page, pageLink: string) => {
	try {
		page.on("response", req => {
			const headers = req.headers();
			const type = headers && headers["content-type"];

			if (type === "text/html" && req.status() === 404) {
				throw new PageNotFoundError();
			}
		});

		await page.goto(pageLink, {
			waitUntil: "domcontentloaded",
			timeout: 60000,
		});

		await page.waitFor("#seo-dir", { timeout: 60000 });

		const content = await page.content();

		return extractCompanies(content);
	} catch (error) {
		if (error instanceof PageNotFoundError) {
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
	newProgress.linkPage = pageNumber;

	writeFile("./src/scrapping/progress.json", JSON.stringify(newProgress, undefined, 4), err => {
		if (err) {
			console.error("Progress Update Error");
			console.log(err);
		}
	});
};
