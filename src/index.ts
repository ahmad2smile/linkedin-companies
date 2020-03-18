import "reflect-metadata";

import { createConnection } from "typeorm";
import { launch } from "puppeteer";

import { getLinksOfCompanies } from "./scrapping/getLinksOfCompanies";
import { login } from "./scrapping/login";
import { Company } from "./entity/Company";

const scrape = async () => {
	const dbConnection = await createConnection();

	const browser = await launch({ headless: true });
	const page = await browser.newPage();

	await login(page);

	for await (const companies of getLinksOfCompanies(page)) {
		await dbConnection.manager.save(companies);
	}

	await browser.close();
};

scrape();
