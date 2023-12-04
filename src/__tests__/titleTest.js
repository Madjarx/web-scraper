const ImageAnalyzer = require('../analyzers/imageAnalyzer');

const imageAnalyzer = new ImageAnalyzer('https://az-alterations.com/wp-content/gallery/bridal/IMG-20230218-WA0001.jpg', ['IMG']);


imageAnalyzer.analyze().then(result => {
    console.log(result);
}
).catch(err => console.log(err));