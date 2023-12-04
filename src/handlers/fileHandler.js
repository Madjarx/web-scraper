const fs = require('fs');
const path = require('path');

/**
 * Class File Handler
 * 
 * TODO - make the code prettier
 */
module.exports = class FileHandler {

    static readLines(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split(',').map(line => line.trim()).filter(line => line !== '');
        console.log(`Read from ${filePath}:`, lines);
        return lines;
    }

    static writeToFile(filePath, data) {
        fs.writeFileSync(filePath, data);
    }

    static appendToFile(filePath, data) {
        fs.appendFileSync(filePath, data);
    }

    static createFileWithTimestamp(dir, filename) {

        fs.mkdirSync(path.resolve(__dirname, dir), { recursive: true });

        const timestamp = Date.now();
        const date = new Date();
        const formattedDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
        const filePath = path.join(dir, `${filename}-${timestamp}-${formattedDate}.txt`);
        fs.writeFileSync(filePath, '');
        return filePath;
    }

    static createDirectoryWithTimestamp(dir) {

        fs.mkdirSync(path.resolve(__dirname, dir), { recursive: true });

        const timestamp = Date.now();
        const date = new Date();
        const formattedDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}__${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
        const directoryPath = path.join(dir, `query-results__${timestamp}__${formattedDate}`);
        fs.mkdirSync(path.resolve(__dirname, directoryPath), { recursive: true });

        return directoryPath;
    }
};