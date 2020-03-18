import * as puppeteer from "puppeteer";
import * as cheerio from "cheerio";

import { username, password } from "../../credentials.json";

export const getCompanyLinks = async () => {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();

	await login(page);

	await page.goto("https://www.linkedin.com/company/amazon?trk=companies_directory", {
		waitUntil: "domcontentloaded",
		timeout: 60000,
	});

	await page.waitFor("h1[title] > span", { timeout: 60000 });

	let content = await page.content();
	const $ = cheerio.load(content);

	const title = $("h1[title] > span").text();

	await browser.close();

	return title;
};

async function login(page: puppeteer.Page) {
	await page.goto("https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin", {
		waitUntil: "networkidle0",
		timeout: 100000,
	});

	page.waitFor(".form__input--floating", { timeout: 100000 });

	const SUBMIT_SELECTOR = "#app__container > main > div > form > div.login__form_action_container > button";

	await page.click("#username");
	await page.keyboard.type(username);

	await page.click("#password");
	await page.keyboard.type(password);

	await page.click(SUBMIT_SELECTOR);
}
