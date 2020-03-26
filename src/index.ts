import "reflect-metadata";

import { createConnection } from "typeorm";
import { launch } from "puppeteer";

import { getLinksOfCompanies } from "./scrapping/getLinksOfCompanies";
import { login } from "./scrapping/login";
import { Company } from "./entity/Company";
import { getCompanyDetails } from "./scrapping/getCompanyDetails";
import { getRandom, waitFor } from "./utils/utils";

const getAuthorizedPage = async () => {
	const browser = await launch({ headless: true });
	const page = await browser.newPage();

	// Get Random Cookies in Page
	await page.goto("https://www.google.com/");
	await page.goto("https://mail.google.com/mail/u/0/");
	await page.goto("https://www.youtube.com/");

	await login(page);

	return {
		page,
		cleanUp: browser.close,
	};
};

const scrape = async () => {
	const dbConnection = await createConnection();

	const { page, cleanUp } = await getAuthorizedPage();

	for await (const companies of getLinksOfCompanies(page)) {
		await dbConnection.manager.save(companies);
	}

	await cleanUp();
};

const total = 269005;

const scrapeCompaniesDetails = async () => {
	const dbConnection = await createConnection();

	const { page, cleanUp } = await getAuthorizedPage();

	const companies: Array<Company> = await dbConnection.manager.query(
		"SELECT * FROM COMPANIES WHERE LENGTH(name) > 3 AND LENGTH(name) < 9 AND logo IS NULL ORDER BY RANDOM()",
	);

	let current = 1;

	for (const c of companies) {
		const company = await getCompanyDetails(page, c.link);

		if (company === null) {
			continue;
		}

		try {
			await dbConnection
				.createQueryBuilder()
				.update(Company)
				.set(company)
				.where("id = :id", { id: c.id })
				.execute();
		} catch (error) {
			console.log(`Error Updating Company: id =${c.id}`);
		}

		process.stdout.write("\x1Bc");
		console.log(`Progress: ${((current / total) * 100).toFixed(4)}%`);

		current++;
		const randomWait = getRandom(5);

		await waitFor(randomWait);
	}

	await cleanUp();
};

scrapeCompaniesDetails();
