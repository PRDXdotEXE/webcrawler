import { crawlSiteAsync } from "./crawl";

async function main() {
    if (process.argv.length < 3) {
        console.log("no website provided");
        process.exit(1);
    }
    if (process.argv.length > 5) {
        console.log("too many arguments provided");
        process.exit(1);
    }
    const baseURL = process.argv[2];
    const maxConcurrency = Number(process.argv[3]);
    const maxPages = Number(process.argv[4]);

    console.log(`starting crawl of: ${baseURL}...`);

    const pages = await crawlSiteAsync(baseURL, maxConcurrency, maxPages);

    console.log(pages);

    process.exit(0);
}

main();
