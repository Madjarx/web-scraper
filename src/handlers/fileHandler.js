const fs = require('fs');
const path = require('path');

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
        // Create the directory if it doesn't exist
        fs.mkdirSync(path.resolve(__dirname, dir), { recursive: true });

        const timestamp = Date.now();
        const date = new Date();
        const formattedDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
        const filePath = path.join(dir, `${filename}-${timestamp}-${formattedDate}.txt`);
        fs.writeFileSync(filePath, '');
        return filePath;
    }

    static createDirectoryWithTimestamp(dir) {
        // Create the directory if it doesn't exist
        fs.mkdirSync(path.resolve(__dirname, dir), { recursive: true });

        const timestamp = Date.now();
        const date = new Date();
        const formattedDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
        const directoryPath = path.join(dir, `query-results-${timestamp}-${formattedDate}`);
        fs.mkdirSync(path.resolve(__dirname, directoryPath), { recursive: true });

        return directoryPath;
    }
};