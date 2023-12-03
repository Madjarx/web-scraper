const axios = require('axios');
const cheerio = require('cheerio');


/**
 * ####  Page Analyzer
 * 
 * Descriptive text!
 * 
 * 
 */
module.exports = class PageAnalyzer {


    /**
     * Class properties
     */
    _url;


    /**
     * Constructor
     */
    constructor(url) {
        this._url = url;
    };


    /**
     * Fetches the content from the specified URL, later on to
     * be analyzed
     * 
     * @returns {Promise<string>} The fetched content.
     * @throws {Error} If the content cannot be fetched.
     */
    async fetchContent() {
        try {
            const response = await axios.get(this._url);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch content from ${this._url}`);
            return '';
        }
    }


    /**
     * Parses the HTML content and extracts all the links
     * 
     * @param {string} html - The HTML content to be parsed.
     * @returns {string[]} - An array of unique links extracted from the HTML.
     */
    parseHTML(html) {
        const $ = cheerio.load(html);
        const links = new Set();

        $('a').each((i, link) => {
            links.add($(link).attr('href'));
        });

        $('[href]').each((i, link) => {
            links.add($(link).attr('href'));
        });

        return Array.from(links);
    };
};
