const WebCrawler = require('../crawlers/webCrawler');

test('WebCrawler.crawl should visit all pages of a website', async () => {
    const crawler = new WebCrawler('https://seosrbija.rs');
    await crawler.crawl();
    
});