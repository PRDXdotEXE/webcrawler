import { argv } from "process";
import { crawlPage } from "./crawl";

async function main() {
    const args = argv.slice(2);

    if (args.length !== 1) {
        console.log("We expect exactly one website URL");
        process.exit(1);
    }

    const url = args[0];

    console.log(url);

    const result = await crawlPage(url);

    process.exit(0);
}

main();
