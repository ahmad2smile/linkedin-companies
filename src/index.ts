import "reflect-metadata";
import { createConnection } from "typeorm";
import { Company } from "./entity/Company";

import { getCompanyLinks } from "./scrapping/getCompanyLinks";

// createConnection()
// 	.then(async connection => {
// 		const company = new Company();

// 		await connection.manager.save(company);

// 		console.log("Here you can setup and run express/koa/any other framework.");
// 	})
// 	.catch(error => console.log(error));

getCompanyLinks().then(console.log);
