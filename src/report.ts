import * as path from "node:path";
import * as fs from "node:fs";
import { ExtractedPageData } from "./crawl";

export function writeJSONReport(
    pageData: Record<string, ExtractedPageData>,
    filename = "report.json",
): void {
    const sorted = Object.values(pageData).sort((a, b) =>
        a.url.localeCompare(b.url),
    );

    const json = JSON.stringify(sorted, null, 2);

    const filePath = path.resolve(process.cwd(), filename);

    fs.writeFileSync(filePath, json);
}
