# Web Crawler

A TypeScript-based web crawler built with Node.js that crawls a website, extracts useful page information, and generates a JSON report.

This project was built as part of the [Boot.dev Web Crawler course](https://www.boot.dev/), with the goal of getting hands-on experience with HTTP requests, HTML parsing, asynchronous programming, concurrency, TypeScript, testing, and file handling.

## Features

- Crawl pages within a website
- Follow internal links between pages
- Normalize URLs to avoid duplicate pages
- Limit crawling to the target hostname
- Control the maximum number of pages to crawl
- Run multiple page requests concurrently
- Fetch HTML using Node.js `fetch`
- Parse HTML using [JSDOM](https://github.com/jsdom/jsdom)
- Extract structured page information:
  - Page URL
  - Heading
  - First paragraph
  - Outgoing links
  - Image URLs
- Track visited pages
- Generate a deterministic JSON report
- Sort report entries by URL
- Unit test crawler functionality with Vitest

## Tech Stack

- **TypeScript**
- **Node.js**
- **JSDOM** — HTML parsing
- **Vitest** — testing
- **NPM** — package management
- **NVM** — Node.js version management

## Requirements

- Node.js `22.15.0`
- NPM
- Git

The project includes an `.nvmrc` file, so if you have NVM installed you can activate the required Node.js version with:

```bash
nvm use
