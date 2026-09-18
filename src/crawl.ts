import { get } from "https";
import { JSDOM } from "jsdom";

type ExtractedPageData = {
    url: string;
    heading: string;
    firstParagraph: string;
    outgoingLinks: string[];
    imageURLs: string[];
};

export async function getHTML(url: string) {
    const response = await fetch(url, {
        headers: {
            "User-Agent": "BootCrawler/1.0",
        },
    });

    if (!response.ok) {
        console.log(`Request failed: ${response.status}`);
        return;
    }

    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("text/html")) {
        console.log("Response is not HTML");
        return;
    }

    return await response.text();
}

export function normalizeURL(url: string): string {
    const myURL = new URL(url);
    let pathname = myURL.pathname.toLowerCase();
    if (pathname.endsWith("/")) {
        pathname = pathname.slice(0, -1);
    }
    pathname = pathname.replace(/\/+/g, "/");
    return myURL.hostname + pathname;
}

export function getHeadingFromHTML(html: string): string {
    const document = new JSDOM(html).window.document;
    const heading =
        document.querySelector("h1") ?? document.querySelector("h2");
    if (!heading) {
        return "no heading or null heading";
    } else {
        return heading.textContent;
    }
}

export function getFirstParagraphFromHTML(html: string): string {
    const document = new JSDOM(html).window.document;
    const paragraph = document.querySelector("p");
    if (!paragraph) {
        return "no paragraph or null paragraph";
    } else {
        return paragraph.textContent;
    }
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
    const document = new JSDOM(html).window.document;
    const a = document.querySelectorAll("a");
    const urls = Array.from(a).map((link) => baseURL + link.href);
    return urls;
}

export function getImagesFromHTML(html: string, baseURL: string): string[] {
    const document = new JSDOM(html).window.document;
    const a = document.querySelectorAll("img");
    const urls = Array.from(a).map((link) => baseURL + link.src);
    return urls;
}

export function extractPageData(
    html: string,
    pageURL: string,
): ExtractedPageData {
    const url = pageURL;
    const heading = getHeadingFromHTML(html);
    const firstParagraph = getFirstParagraphFromHTML(html);
    const outgoingLinks: string[] = getURLsFromHTML(html, url);
    const imageURLs: string[] = getImagesFromHTML(html, url);

    return {
        url,
        heading,
        firstParagraph,
        outgoingLinks,
        imageURLs,
    };
}

export async function crawlPage(
    baseURL: string,
    currentURL: string = baseURL,
    pages: Record<string, number> = {},
) {
    const url = new URL(baseURL);
    const crntURL = new URL(currentURL);
    if (url.hostname !== crntURL.hostname) {
        return pages;
    }
    const normalURL = normalizeURL(currentURL);
    if (normalURL in pages) {
        pages[normalURL] = pages[normalURL] + 1;
        return pages;
    }
    pages[normalURL] = 1;
    console.log(`crawling ${currentURL}`);

    const html = await getHTML(currentURL);

    const urls = getURLsFromHTML(html as string, baseURL);
    for (const url of urls) {
        crawlPage(baseURL, url, pages);
    }
    return pages;
}
