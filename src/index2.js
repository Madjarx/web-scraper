// const ImageAnalyzer = require('./analyzers/imageAnalyzer');
const TextAnalysis = require('./analyzers/textAnalyzer')


// const keywords = ['Stela', 'gallery', 'https://az-alterations.com/wp-content/gallery/StelaAlex-59.jpg']
// const imageAnalyzer = new ImageAnalyzer('https://az-alterations.com/wp-content/gallery/StelaAlex-59.jpg', keywords);

const keywords = ['Las Vegas']
const url = 'https://az-alterations.com/'
const textAnalyzer = new TextAnalysis(url, keywords);

async function main() {
    // const result = await imageAnalyzer.analyze();
    const result = await textAnalyzer.analyze();
    console.log(result);
}

main()
    .catch(error => console.error(`Failed to analyze image: ${error}`));