import { expect, test } from "vitest";
import {
    extractPageData,
    getFirstParagraphFromHTML,
    getHeadingFromHTML,
    getImagesFromHTML,
    getURLsFromHTML,
    normalizeURL,
} from "./crawl";

test("normalizing the url", () => {
    expect(normalizeURL("https://www.boot.dev/blog/path/")).toBe(
        "www.boot.dev/blog/path",
    );

    expect(normalizeURL("https://www.boot.dev/blog/path")).toBe(
        "www.boot.dev/blog/path",
    );

    expect(normalizeURL("http://www.boot.dev/blog/path/")).toBe(
        "www.boot.dev/blog/path",
    );

    expect(normalizeURL("http://www.boot.dev/blog/path")).toBe(
        "www.boot.dev/blog/path",
    );
});
test("normalize capitals in hostname", () => {
    expect(normalizeURL("https://WWW.BOOT.DEV/blog/path")).toBe(
        "www.boot.dev/blog/path",
    );
});
test("strip fragments/hashes", () => {
    expect(normalizeURL("https://www.boot.dev/blog/path#section-1")).toBe(
        "www.boot.dev/blog/path",
    );
});

test("strip query parameters", () => {
    expect(
        normalizeURL("https://www.boot.dev/blog/path?utm_source=google"),
    ).toBe("www.boot.dev/blog/path");
});
test("handle root domains with and without trailing slashes", () => {
    expect(normalizeURL("https://www.boot.dev")).toBe("www.boot.dev");
    expect(normalizeURL("https://www.boot.dev/")).toBe("www.boot.dev");
});
test("normalize multiple consecutive slashes in path", () => {
    expect(normalizeURL("https://www.boot.dev//blog///path")).toBe(
        "www.boot.dev/blog/path",
    );
});
test("strip default port numbers", () => {
    expect(normalizeURL("https://www.boot.dev:443/blog/path")).toBe(
        "www.boot.dev/blog/path",
    );
    expect(normalizeURL("http://www.boot.dev:80/blog/path")).toBe(
        "www.boot.dev/blog/path",
    );
});

test("getHeadingFromHTML basic", () => {
    const inputBody = `<html><body><h1>Test Title</h1></body></html>`;
    const actual = getHeadingFromHTML(inputBody);
    const expected = "Test Title";
    expect(actual).toEqual(expected);
});

test("getHeadingFromHTML basic", () => {
    const inputBody = `<html><body></body></html>`;
    const actual = getHeadingFromHTML(inputBody);
    const expected = "no heading or null heading";
    expect(actual).toEqual(expected);
});

test("getMainParagraph", () => {
    const inputBody = `<html><body>
          <p>Outside paragraph.</p>
          <main>
            <p>Main paragraph.</p>
          </main>
        </body></html`;
    const actual = getFirstParagraphFromHTML(inputBody);
    const expected = "Outside paragraph.";
    expect(actual).toEqual(expected);
});

test("getMainParagraph", () => {
    const inputBody = `<html><body>

          <main>

          </main>
        </body></html`;
    const actual = getFirstParagraphFromHTML(inputBody);
    const expected = "no paragraph or null paragraph";
    expect(actual).toEqual(expected);
});

test("getURLsFromHTML absolute", () => {
    const inputURL = "https://crawler-test.com";
    const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span></a></body></html>`;

    const actual = getURLsFromHTML(inputBody, inputURL);
    const expected = ["https://crawler-test.com/path/one"];

    expect(actual).toEqual(expected);
});
test("getURLsFromHTML multiple links", () => {
    const inputURL = "https://crawler-test.com";
    const inputBody = `
        <html>
            <body>
                <a href="/path/one">One</a>
                <a href="/path/two">Two</a>
                <a href="/path/three">Three</a>
            </body>
        </html>
    `;

    const actual = getURLsFromHTML(inputBody, inputURL);
    const expected = [
        "https://crawler-test.com/path/one",
        "https://crawler-test.com/path/two",
        "https://crawler-test.com/path/three",
    ];

    expect(actual).toEqual(expected);
});

test("getHeadingFromHTML returns first heading", () => {
    const inputBody = `
        <html>
            <body>
                <h1>First Heading</h1>
                <h1>Second Heading</h1>
            </body>
        </html>
    `;

    const actual = getHeadingFromHTML(inputBody);
    const expected = "First Heading";

    expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTL returns first paragraph", () => {
    const inputBody = `
        <html>
            <body>
                <p>First paragraph.</p>
                <p>Second paragraph.</p>
            </body>
        </html>
    `;

    const actual = getFirstParagraphFromHTML(inputBody);
    const expected = "First paragraph.";

    expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTL handles paragraph inside main", () => {
    const inputBody = `
        <html>
            <body>
                <main>
                    <p>Main paragraph.</p>
                </main>
            </body>
        </html>
    `;

    const actual = getFirstParagraphFromHTML(inputBody);
    const expected = "Main paragraph.";

    expect(actual).toEqual(expected);
});

test("getImagesFromHTML relative", () => {
    const inputURL = "https://crawler-test.com";
    const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`;

    const actual = getImagesFromHTML(inputBody, inputURL);
    const expected = ["https://crawler-test.com/logo.png"];

    expect(actual).toEqual(expected);
});

test("extractPageData basic", () => {
    const inputURL = "https://crawler-test.com";
    const inputBody = `
      <html><body>
        <h1>Test Title</h1>
        <p>This is the first paragraph.</p>
        <a href="/link1">Link 1</a>
        <img src="/image1.jpg" alt="Image 1">
      </body></html>
    `;
    const actual = extractPageData(inputBody, inputURL);
    const expected = {
        url: "https://crawler-test.com",
        heading: "Test Title",
        firstParagraph: "This is the first paragraph.",
        outgoingLinks: ["https://crawler-test.com/link1"],
        imageURLs: ["https://crawler-test.com/image1.jpg"],
    };

    expect(actual).toEqual(expected);
});
