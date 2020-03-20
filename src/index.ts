import "reflect-metadata";

import { createConnection } from "typeorm";
import { launch } from "puppeteer";

import { getLinksOfCompanies } from "./scrapping/getLinksOfCompanies";
import { login } from "./scrapping/login";
import { Company } from "./entity/Company";
import { getCompanyDetails } from "./scrapping/getCompanyDetails";

const getAuthorizedPage = async () => {
	const browser = await launch({ headless: true });
	const page = await browser.newPage();

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

const scrapeCompaniesDetails = async () => {
	const dbConnection = await createConnection();

	const { page, cleanUp } = await getAuthorizedPage();

	const companies: Array<Company> = await dbConnection.manager.query(
		"SELECT * FROM COMPANIES WHERE LENGTH(name) > 4 AND logo IS NULL",
	);

	for (const c of companies) {
		const company = await getCompanyDetails(page, c.link);

		if (company === null) {
			continue;
		}

		await dbConnection
			.createQueryBuilder()
			.update(Company)
			.set(company)
			.where("id = :id", { id: c.id })
			.execute();

		console.log(`Updated Company: ${c.name}`);
	}

	await cleanUp();
};

scrapeCompaniesDetails();
