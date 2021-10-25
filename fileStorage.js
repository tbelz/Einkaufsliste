const fs = require("fs");

/**
 * @param {string} filename The filename for the saved file.
 * @param {object} data The data to be saved. Needs to be an object.
 */
function writeData(filename, data) {
    if (Array.isArray(data)) {
        throw new Error(`Using arrays is not supported. You can use an object with an array as one field. For example {"users": []}.`)
    }
    if (typeof data !== 'object') {
        throw new Error(`Data needs to be a javascript object.`)
    }
    // First write to a temporary file to avoid corrupt file data
    // if for example the program gets closed at the same time.
    const tempFile = filename + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
    // Rename is an atomic operation .. it either happens completely or not at all.
    // so this should never lead to corrupt data.
    fs.renameSync(tempFile, filename);
}

/**
 * Reads data from a file. If the file does not exist yet or cannot be read it returns an empty object.
 *
 * @param {string} filename The filename to try to read data from.
 */
function readData(filename) {
    let stringData = ""
    try {
        stringData = fs.readFileSync(filename);
    } catch {
        console.warn(`Database file ${filename} could not be read - Starting with empty data.`)
    }
    try {
        return JSON.parse(stringData);
    } catch {
        console.warn(`Could not parse JSON: (${stringData})`)
        return {}
    }
}

module.exports = {readData, writeData};