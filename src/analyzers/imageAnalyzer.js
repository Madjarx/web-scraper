const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Class Image Analysis
 * 
 * Analyzes the images on a page for the presence of keywords
 */
module.exports = class ImageAnalysis {

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
     * @returns {Promise<object[]>} - An array of objects containing the keyword, image source, image location, and matched attributes
     */
    async analyze() {
        try {
            const response = await axios.get(this.url);
            const $ = cheerio.load(response.data);
            const matchingImages = [];

            $('img').each((i, img) => {

                const src = $(img).attr('src');
                const alt = $(img).attr('alt')?.toLowerCase();
                const title = $(img).attr('title')?.toLowerCase();
                const metaTitle = $(img).data('meta-title')?.toLowerCase();
                const metaDescription = $(img).data('meta-description')?.toLowerCase();
                const imageName = path.basename(src)?.toLowerCase();

                this.keywords.forEach(keyword => {
                    const url = this.url.toLowerCase();

                    if ((title && title.includes(keyword)) ||                   // - title
                        (alt && alt.includes(keyword)) ||                       // - alt
                        (url && url.includes(keyword)) ||                       // - url
                        (imageName && imageName.includes(keyword)) ||           // - image name (src)
                        (metaTitle && metaTitle.includes(keyword)) ||           // - meta title
                        (metaDescription && metaDescription.includes(keyword))) // - meta description
                        {

                        const output = {
                            type: 'image-match',
                            keyword: keyword,
                            matched: [title, alt, metaTitle, metaDescription, imageName, url].filter(attr => attr && attr.includes(keyword)),
                            imageSource: src,
                            imageLocation: this.url,
                        };

                        matchingImages.push(output);
                    }
                });
            });

            return matchingImages;

        } catch (error) {
            console.error(`Failed to analyze images at ${this.url}: ${error}`);
            return [];
        }
    }
};