const clc = require("cli-color");
const axios = require('axios');
const cheerio = require('cheerio');
const urlModule = require('url');


const TextAnalysis = require('../analyzers/textAnalyzer');
const ImageAnalysis = require('../analyzers/imageAnalyzer');


const instance = axios.create();
// instance.defaults.timeout = 25000; // Not sure if i need this or not, still to discuss

// instance.interceptors.request.use((config) => {
//   config.headers['Cache-Control'] = 'no-cache';
//   config.headers['Pragma'] = 'no-cache';
//   config.headers['Expires'] = '0';
//   return config;
// });

/**
 * Class Web Crawler
 * 
 * Crawls a website and analyzes the text and images on each page
 * 
 */
module.exports = class WebCrawler {

    /** Class Properties */
    _baseUrl;
    _visitedLinks;
    _queue;
    _allLinks;
    _startTime;
    _keywords; 
    _results; 


    /**
     * Constructor
     * 
     * @param {string} baseUrl - The URL of the page to crawl 
     * @param {string[]} keywords - The keywords to search for 
     */
    constructor(baseUrl, keywords) { 
        this._baseUrl = baseUrl;
        this._keywords = keywords;
        this._queue = [baseUrl];
        this._results = []; 
        this._startTime = null;
        this._allLinks = new Set();
        this._visitedLinks = new Set();
    };



    /**
     * Normalizes the URL by removing the trailing slash
     * 
     */
    _normalizeUrl(url) {
        return url.endsWith('/') ? url.slice(0, -1) : url;
    }


    /**
     * Checks if the URL is inbound
     * 
     */
    _isInbound(url) {
        const baseUrlDomain = new urlModule.URL(this._baseUrl).hostname;
        const urlDomain = new urlModule.URL(url).hostname;
        return urlDomain.endsWith(baseUrlDomain);
    }


    /**
     * Fetches and parses the page at the given URL
     * 
     * @param {string} url - The URL to fetch and parse 
     * @returns {Promise<string[]>} - An array of URLs found on the page
     * 
     */
    async _fetchAndParse(url) {
        try {
            const response = await instance.get(url);
            const $ = cheerio.load(response.data);
            const links = [];

            $('a').each((i, link) => {
                const href = $(link).attr('href');

                if (href && typeof href === 'string') {
                    const absoluteUrl = urlModule.resolve(url, href);
                    links.push(absoluteUrl);
                }
            });

            return links;
        } catch (error) {
            console.error(clc.red(`Failed to fetch ${url}: ${error}`));
            return [];
        }
    };


    /**
     * Crawls the website and analyzes the text and images on each page
     * 
     * @param {boolean} enableImageAnalysis - Whether or not to analyze images, defaults to true
     * @param {boolean} enableTextAnalysis - Whether or not to analyze text, defaults to true
     * 
     * @returns {Promise<object>} - An object containing the results of the crawl
     */
    async crawl(enableImageAnalysis = true, enableTextAnalysis = true) {
        /** Log the starting configuration */
        console.log(clc.greenBright(`${new Date().toLocaleString()} - Starting to crawl: ${this._baseUrl}`));
        if (enableImageAnalysis) console.log(clc.greenBright('Image analysis is enabled'));
        if (enableTextAnalysis) console.log(clc.greenBright('Text analysis is enabled'));

        this._startTime = Date.now();
        
        /** Crawl the website */
        while (this._queue.length > 0) {

            const url = this._queue.shift();
            // const originalUrl = this._queue.shift();
            // const url = this._normalizeUrl(originalUrl); // normalize the url to avoid stuff like trailing dash interfering with the visited links set 

            if (this._visitedLinks.has(url)) continue;
            this._visitedLinks.add(url);
            console.log(`Visiting: ${url}`);
            const links = await this._fetchAndParse(url);
    
    
    
            // #region Image Analysis Block
            if (enableImageAnalysis) {
                const imageAnalysis = new ImageAnalysis(url, this._keywords);
                const matchingImages = await imageAnalysis.analyze();
                console.log(clc.greenBright(`Found ${matchingImages.length} matching images on ${url}`));
                
                matchingImages.forEach(image => {
                    if (!this._results.find(result => result.imageSource === image.imageSource)) {
                        this._results.push(image);
                    }
                });
            }
            // #endregion

            // #region Text Analysis Block
            if (enableTextAnalysis) {
                const textAnalysis = new TextAnalysis(url, this._keywords);
                const matchingTexts = await textAnalysis.analyze();
                console.log(clc.greenBright(`Found ${matchingTexts.length} matching texts on ${url}`));
                
                matchingTexts.forEach(text => {
                    if (!this._results.find(result => result.textLocation === text.textLocation && result.keyword === text.keyword)) {
                        this._results.push(text);
                    }
                });
            }
            // #endregion

    
            /** Deal with the links queue */
            links.forEach(link => {
                if (this._isInbound(link)) {
                    this._allLinks.add(link);
                    if (!this._visitedLinks.has(link) && !this._queue.includes(link)) {
                        this._queue.push(link);
                        // console.log(`Found new link: ${link}`);
                    }
                }
            });
    
            console.log(`Finished visiting: ${url}`);
        };
    
        // #region Time data transformation
        /**  Script running information  */
        const elapsedTime = Date.now() - this._startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = ((elapsedTime % 60000) / 1000).toFixed(0);
        // #endregion

        console.log(`Finished crawling: ${this._baseUrl}`);
        
        /**
         * Return object
         * TODO: Document this stuff with jsdoc
         */
        return {
            elapsedTime: `${minutes} minutes ${seconds} seconds`,
            foundLinks: this._allLinks.size,
            links: Array.from(this._allLinks),
            results: this._results
        };
    }
}