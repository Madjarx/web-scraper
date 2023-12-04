require('dotenv').config();
const path = require('path');
const clc = require("cli-color");

const WebCrawler = require('./crawlers/webCrawler');
const FileHandler = require('./handlers/fileHandler');


/**
 * Get the URLs to crawl and keywords from the txt files
 */
const urls = FileHandler.readLines(path.join(__dirname, process.env.DATA_DIR, process.env.WEBSITES_FILE));
const keywords = FileHandler.readLines(path.join(__dirname, process.env.DATA_DIR, process.env.KEYWORDS_FILE));

/**
 * Crawl configuration
 */
const enableImageAnalysis = process.env.ENABLE_IMAGE_ANALYSIS === 'true' ? true : false; // maybe a better way is to check if it exists cus i instructed to comment out
const enableTextAnalysis = process.env.ENABLE_TEXT_ANALYSIS === 'true' ? true : false;



/**
 * Main function implementation
 */
async function main() {

    urls.forEach(baseUrl => {

        const crawler = new WebCrawler(baseUrl, keywords);

        crawler.crawl(enableImageAnalysis, enableTextAnalysis)
            .then(result => {
                console.log(clc.greenBright('Analysis completed successfully!'));
                console.log(`Script ran for ${result.elapsedTime} and found ${result.foundLinks} links.`);
                console.log('Links Crawled:', result.links);
                console.log(`Found ${result.results.length} matching results.`);
                console.log('Here are the results:', result.results);

                // Create a new directory with a timestamp for the query
                const dirPath = FileHandler.createDirectoryWithTimestamp(path.join(__dirname, process.env.RESULTS_DIR));

                // TODO: Implement the writes to different files for different queries
                // FileHandler.writeToFile(path.join(dirPath, process.env.QUERY_IMAGES_MATCHES_FILE), JSON.stringify(result.imageResults, null, 2));
                // FileHandler.writeToFile(path.join(dirPath, process.env.QUERY_TEXT_MATCHES_FILE), JSON.stringify(result.textResults, null, 2));
                FileHandler.writeToFile(path.join(dirPath, 'query-results.txt'), JSON.stringify(result.results, null, 2));

                FileHandler.writeToFile(path.join(dirPath, process.env.ALL_RESULTS_FILE), JSON.stringify(result, null, 2));
                FileHandler.writeToFile(path.join(dirPath, process.env.VISITED_LINKS_FILE), JSON.stringify(result.links, null, 2));
                FileHandler.writeToFile(path.join(dirPath, process.env.QUERY_INFO_FILE), JSON.stringify({
                    elapsedTime: result.elapsedTime,
                    foundLinks: result.foundLinks,
                    keywords: keywords,
                    websites: urls
                }, null, 2));

                console.log(`Results written to ${dirPath}`);
            });
    });
};


/**
 * Main function Execution
 * 
 */
main()
    .catch(error => console.error(clc.red(`Failed to crawl: ${error}`)));