import { JSDOM } from "jsdom";
import pLimit from "p-limit";
import { vi } from "vitest";

export function normalizeURL(url: string) {
    const urlObj = new URL(url);
    let fullPath = `${urlObj.host}${urlObj.pathname}`;
    if (fullPath.slice(-1) === "/") {
        fullPath = fullPath.slice(0, -1);
    }
    return fullPath;
}

export function getHeadingFromHTML(html: string): string {
    try {
        const dom = new JSDOM(html);
        const doc = dom.window.document;
        const h1 = doc.querySelector("h1") ?? doc.querySelector("h2");
        return (h1?.textContent ?? "").trim();
    } catch {
        return "";
    }
}

export function getFirstParagraphFromHTML(html: string): string {
    try {
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        const main = doc.querySelector("main");
        const p = main?.querySelector("p") ?? doc.querySelector("p");
        return (p?.textContent ?? "").trim();
    } catch {
        return "";
    }
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
    const urls: string[] = [];
    try {
        const dom = new JSDOM(html);
        const doc = dom.window.document;
        const anchors = doc.querySelectorAll("a");

        anchors.forEach((anchor) => {
            const href = anchor.getAttribute("href");
            if (!href) return;

            try {
                const absoluteURL = new URL(href, baseURL).toString();
                urls.push(absoluteURL);
            } catch (err) {
                console.error(`invalid href '${href}':`, err);
            }
        });
    } catch (err) {
        console.error("failed to parse HTML:", err);
    }
    return urls;
}

export function getImagesFromHTML(html: string, baseURL: string): string[] {
    const imageURLs: string[] = [];
    try {
        const dom = new JSDOM(html);
        const doc = dom.window.document;
        const images = doc.querySelectorAll("img");

        images.forEach((img) => {
            const src = img.getAttribute("src");
            if (!src) return;

            try {
                const absoluteURL = new URL(src, baseURL).toString();
                imageURLs.push(absoluteURL);
            } catch (err) {
                console.error(`invalid src '${src}':`, err);
            }
        });
    } catch (err) {
        console.error("failed to parse HTML:", err);
    }
    return imageURLs;
}

export type ExtractedPageData = {
    url: string;
    heading: string;
    first_paragraph: string;
    outgoing_links: string[];
    image_urls: string[];
};

export function extractPageData(
    html: string,
    pageURL: string,
): ExtractedPageData {
    return {
        url: pageURL,
        heading: getHeadingFromHTML(html),
        first_paragraph: getFirstParagraphFromHTML(html),
        outgoing_links: getURLsFromHTML(html, pageURL),
        image_urls: getImagesFromHTML(html, pageURL),
    };
}

class ConcurrentCrawler {
    private baseURL: string;
    private pages: Record<string, number>;
    private limit: <T>(fn: () => Promise<T>) => Promise<T>;
    private maxPages: number;
    private shouldStop: boolean;
    private allTasks: Set<Promise<void>>;
    private visited: Set<string>;

    constructor(baseURL: string, maxConcurrency: number, maxPages: number) {
        this.maxPages = maxPages;
        this.shouldStop = false;
        this.allTasks = new Set();
        this.visited = new Set();
        this.baseURL = baseURL;
        this.pages = {};
        this.limit = pLimit(maxConcurrency);
    }

    private addPageVisit(normalizedURL: string): boolean {
        if (this.shouldStop === true) {
            return false;
        }
        if (this.visited.has(normalizedURL)) {
            this.pages[normalizedURL]++;
            return false;
        }
        if (this.visited.size >= this.maxPages) {
            this.shouldStop = true;
            console.log("Reached maximum number of pages to crawl.");
            return false;
        }

        this.visited.add(normalizedURL);
        this.pages[normalizedURL] = 1;

        return true;
    }

    private async getHTML(currentURL: string): Promise<string> {
        return await this.limit(async () => {
            let res;
            try {
                res = await fetch(currentURL, {
                    headers: { "User-Agent": "BootCrawler/1.0" },
                });
            } catch (err) {
                throw new Error(`Got Network error: ${(err as Error).message}`);
            }

            if (res.status > 399) {
                throw new Error(
                    `Got HTTP error: ${res.status} ${res.statusText}`,
                );
            }

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("text/html")) {
                throw new Error(`Got non-HTML response: ${contentType}`);
            }

            return res.text();
        });
    }

    private async crawlPage(currentURL: string): Promise<void> {
        if (this.shouldStop === true) {
            return;
        }
        const currentURLObj = new URL(currentURL);
        const baseURLObj = new URL(this.baseURL);
        if (currentURLObj.hostname !== baseURLObj.hostname) {
            return;
        }

        const normalizedURL = normalizeURL(currentURL);

        if (!this.addPageVisit(normalizedURL)) {
            return;
        }

        console.log(`crawling ${currentURL}`);
        let html = "";
        try {
            html = await this.getHTML(currentURL);
        } catch (err) {
            console.log(`${(err as Error).message}`);
            return;
        }

        const nextURLs = getURLsFromHTML(html, currentURL);

        const crawlPromises = nextURLs.map((nextURL) =>
            this.crawlPage(nextURL),
        );

        await Promise.all(crawlPromises);
    }

    async crawl(): Promise<Record<string, number>> {
        const task = this.crawlPage(this.baseURL);
        this.allTasks.add(task);
        task.finally(() => {
            this.allTasks.delete(task);
        });
        await task;
        return this.pages;
    }
}

export async function crawlSiteAsync(
    baseURL: string,
    maxConcurrency: number,
    maxPages: number,
): Promise<Record<string, number>> {
    const crawler = new ConcurrentCrawler(baseURL, maxConcurrency, maxPages);
    return await crawler.crawl();
}
