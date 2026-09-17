import { JSDOM } from "jsdom";

type ExtractedPageData = {
    url: string;
    heading: string;
    firstParagraph: string;
    outgoingLinks: string[];
    imageURLs: string[];
};

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

export function getFirstParagraphFromHTL(html: string): string {
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
    const firstParagraph = getFirstParagraphFromHTL(html);
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
