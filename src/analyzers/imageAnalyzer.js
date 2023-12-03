const axios = require('axios');
const cheerio = require('cheerio');

module.exports = class ImageAnalysis {
    constructor(url, keywords) {
        this.url = url;
        this.keywords = keywords.map(keyword => keyword.toLowerCase());
    }

    async analyze() {
        try {
            const response = await axios.get(this.url);
            const $ = cheerio.load(response.data);
            const matchingImages = [];
            $('img').each((i, img) => {
                const title = $(img).attr('title')?.toLowerCase();
                const alt = $(img).attr('alt')?.toLowerCase();
                const metaTitle = $(img).data('meta-title')?.toLowerCase();
                const metaDescription = $(img).data('meta-description')?.toLowerCase();
                this.keywords.forEach(keyword => {
                    if ((title && title.includes(keyword)) || 
                        (alt && alt.includes(keyword)) || 
                        (metaTitle && metaTitle.includes(keyword)) || 
                        (metaDescription && metaDescription.includes(keyword))) {
                        const output = {
                            keyword: keyword,
                            imageSource: $(img).attr('src'),
                            imageLocation: this.url,
                            matched: [title, alt, metaTitle, metaDescription].filter(attr => attr && attr.includes(keyword)),
                            // html: `<a href="${$(img).attr('src')}" target="_blank"><img src="${$(img).attr('src')}" width="100" /></a>` // Add an HTML property
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