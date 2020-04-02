import { Page } from "puppeteer";

import { users } from "../../credentials.json";

export async function login(page: Page) {
	await page.goto("https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin", {
		waitUntil: "networkidle0",
		timeout: 100000,
	});

	page.waitFor(".form__input--floating", { timeout: 100000 });

	const userToSelect = process.argv[2];

	const { username, password } = users[Number(userToSelect)];

	await page.click("#username");
	await page.keyboard.type(username);

	await page.click("#password");
	await page.keyboard.type(password);

	const SUBMIT_SELECTOR = "#app__container > main > div > form > div.login__form_action_container > button";
	await page.click(SUBMIT_SELECTOR);
}
