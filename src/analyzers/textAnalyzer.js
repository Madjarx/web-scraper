const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Class Text Analysis
 * 
 * Analyzes the text on a page for the presence of keywords
 */
module.exports = class TextAnalysis {

    /** Class properties */
    url;
    keywords;

    /**
     * Constructor
     * 
     * @param {string} url - The URL of the page to analyze
     * @param {string[]} keywords - The keywords to search for
     * 
     */
    constructor(url, keywords) {
        this.url = url;
        this.keywords = keywords.map(keyword => keyword.toLowerCase());
    };

    /**
     * 
     * @returns {Promise<object[]>} - An array of objects containing the keyword, text location, and matched attributes
     */
    async analyze() {
        try {
            const response = await axios.get(this.url);
            const $ = cheerio.load(response.data);
            const matchingTexts = [];

            $('p, h1, h2, h3, h4, h5, h6, a, span, title, strong, q, b, u, i').each((i, element) => {

                const text = $(element).text()?.toLowerCase();

                this.keywords.forEach(keyword => {

                    if (text && text.includes(keyword)) {

                        const output = {
                            type: 'text-match',
                            keyword: keyword,
                            matched: [text].filter(attr => attr && attr.includes(keyword)),
                            textLocation: this.url,
                        };

                        matchingTexts.push(output);
                    }
                });
            });

            return matchingTexts;

        } catch (error) {
            console.error(`Failed to analyze text at ${this.url}: ${error}`);
            return [];
        }
    }
};