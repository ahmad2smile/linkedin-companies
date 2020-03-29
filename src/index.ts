import "reflect-metadata";

import { createConnection } from "typeorm";
import { launch } from "puppeteer";

import { getLinksOfCompanies } from "./scrapping/getLinksOfCompanies";
import { login } from "./scrapping/login";
import { Company } from "./entity/Company";
import { getCompanyDetails } from "./scrapping/getCompanyDetails";
import { getRandom } from "./utils/utils";
import { logger } from "./utils/logger";

const getAuthorizedPage = async () => {
	const browser = await launch({ headless: false });
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

	page.screenshot({ path: "./after_login.jpg" });

	const companies: Array<Company> = await dbConnection.manager.query(
		"SELECT * FROM COMPANIES WHERE LENGTH(name) > 3 AND LENGTH(name) < 9 AND logo IS NULL ORDER BY RANDOM()",
	);

	let current = 1;

	for (const c of companies) {
		process.stdout.write("\x1Bc");

		const company = await getCompanyDetails(page, c.link.replace("?trk=companies_directory", ""));

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
			logger.error(JSON.stringify(error));

			logger.error(`Error Updating Company: id =${c.id}`);
		}

		logger.info(`Progress: ${((current / total) * 100).toFixed(4)}%`);

		current++;
	}

	await cleanUp();
};

scrapeCompaniesDetails();
