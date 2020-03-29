import * as winston from "winston";

export const logger = winston.createLogger({
	level: "info",
	format: winston.format.json(),
	defaultMeta: { service: "user-service" },
	transports: [
		new winston.transports.File({ filename: "combined.log" }),
		new winston.transports.Console({
			format: winston.format.simple(),
		}),
	],
});
