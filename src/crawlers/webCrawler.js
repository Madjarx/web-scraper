const axios = require('axios');
const cheerio = require('cheerio');
const urlModule = require('url');
const ImageAnalysis = require('../analyzers/imageAnalyzer');
const clc = require("cli-color");


const instance = axios.create();
// instance.defaults.timeout = 25000; // Not sure if i need this or not, still to discuss

// instance.interceptors.request.use((config) => {
//   config.headers['Cache-Control'] = 'no-cache';
//   config.headers['Pragma'] = 'no-cache';
//   config.headers['Expires'] = '0';
//   return config;
// });


module.exports = class WebCrawler {

    _baseUrl;
    _visitedLinks;
    _queue;
    _allLinks;
    _startTime;
    _keywords; 
    _results; 

    constructor(baseUrl, keywords) { 
        this._baseUrl = baseUrl;
        this._visitedLinks = new Set();
        this._queue = [baseUrl];
        this._allLinks = new Set();
        this._startTime = null;
        this._keywords = keywords;
        this._results = []; 
    }

    _normalizeUrl(url) {
        return url.endsWith('/') ? url.slice(0, -1) : url;
    }

    _isInbound(url) {
        const baseUrlDomain = new urlModule.URL(this._baseUrl).hostname;
        const urlDomain = new urlModule.URL(url).hostname;
        return urlDomain.endsWith(baseUrlDomain);
    }

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
    }

    async crawl() {
        this._startTime = Date.now();
        while (this._queue.length > 0) {
            const url = this._queue.shift();
            if (this._visitedLinks.has(url)) continue;
            this._visitedLinks.add(url);
    
            console.log(`Visiting: ${url}`);
    
            const links = await this._fetchAndParse(url);
    
            const imageAnalysis = new ImageAnalysis(url, this._keywords);
            const matchingImages = await imageAnalysis.analyze();
            console.log(clc.greenBright(`Found ${matchingImages.length} matching images on ${url}`));
            
            matchingImages.forEach(image => {
                if (!this._results.find(result => result.imageSource === image.imageSource)) {
                    this._results.push(image);
                }
            });
    
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
        }
    
        const elapsedTime = Date.now() - this._startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = ((elapsedTime % 60000) / 1000).toFixed(0);
    
        console.log(`Finished crawling: ${this._baseUrl}`);
        return {
            elapsedTime: `${minutes} minutes ${seconds} seconds`,
            foundLinks: this._allLinks.size,
            links: Array.from(this._allLinks),
            results: this._results
        };
    }
}