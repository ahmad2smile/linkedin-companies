# LinkedIn Scrapping

## Intro

Project uses [Puppeteer](https://github.com/puppeteer/puppeteer) , [TypeORM](https://github.com/typeorm/typeorm) and [PostgreSQL](https://www.postgresql.org/).

## Setup

Prerequisite:

1. Install PostgreSQL [Link](https://www.postgresql.org/download/)
2. Install NodeJS [Link](https://nodejs.org/en/)

Config:

1. Change password for PostgreSQL in `ormconfig.json`
2. In project directory run


        npm run install

## Run

In project directory run for 1st account:

    npm run start 0

For 2nd account:

    npm run start 1

Note: For accounts check `credentials.json`, add more accounts and increase number like 2, 3, 4...

## Precautions

To get around LinkedIn defences against Web Scraping:

1. Avoid using multiple accounts back to back, at least 2 hours delay b/w next account scraping
2. Do not use 1 account more than once in 24hours. I guessed number of requests per account are around 600-700 per day.
3. Use certain account on the same time very day. Like around mid night or around afternoon to be consistence.
4. Do not use accounts on different VPN/Proxy every time.

The goal of these precaution is to simulate organic use of accounts.

Note: LinkedIn scraping is completely legal, but LinkedIn also has to block users for any reason they deem fit.
