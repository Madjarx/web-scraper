require('dotenv').config();
const WebCrawler = require('./crawlers/webCrawler');
const FileHandler = require('./handlers/fileHandler');

const clc = require("cli-color");
const path = require('path');

// Read URLs and keywords from text files
const urls = FileHandler.readLines(path.join(__dirname, process.env.DATA_DIR, process.env.WEBSITES_FILE));
const keywords = FileHandler.readLines(path.join(__dirname, process.env.DATA_DIR, process.env.KEYWORDS_FILE));

async function main() {
    urls.forEach(baseUrl => {
        const crawler = new WebCrawler(baseUrl, keywords);
        crawler.crawl().then(result => {
            console.log(clc.greenBright('Crawl completed successfully!'));
            console.log(`Script ran for ${result.elapsedTime} and found ${result.foundLinks} links.`);
            console.log('Links Crawled:', result.links);
            console.log(`Found ${result.results.length} matching images.`);
            console.log('Here are the results:', result.results);

            // Create a new directory for the query
            const dirPath = FileHandler.createDirectoryWithTimestamp(path.join(__dirname, process.env.RESULTS_DIR));

            // Write the results to separate files in the directory
            FileHandler.writeToFile(path.join(dirPath, process.env.QUERY_MATCHES_FILE), JSON.stringify(result.results, null, 2));
            FileHandler.writeToFile(path.join(dirPath, process.env.VISITED_LINKS_FILE), JSON.stringify(result.links, null, 2));
            FileHandler.writeToFile(path.join(dirPath, process.env.QUERY_INFO_FILE), JSON.stringify({
                elapsedTime: result.elapsedTime,
                foundLinks: result.foundLinks,
                keywords: keywords,
                websites: urls
            }, null, 2));
            FileHandler.writeToFile(path.join(dirPath, process.env.ALL_RESULTS_FILE), JSON.stringify(result, null, 2));

            console.log(`Results written to ${dirPath}`);
        });
    });
};

main()
    .catch(error => console.error(clc.red(`Failed to crawl: ${error}`)));