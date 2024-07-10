/**
 * Module for managing files, including saving, appending, checking existence, and removing.
 * @module FileController
 */
const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');


/**
 * Array of allowed file extensions for downloaded files.
 * @constant {string[]}
 */
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg', 'gif', 'avif', 'webp'];

/**
 * Asynchronous function to download an image from a provided URL, save it to a local directory,
 * and return the generated filename.
 *
 * @param {string} link - The URL of the image to download.
 * @returns {Promise<string|null>} - A Promise that resolves to the generated filename if successful,
 * or null if the provided link is empty or if an error occurs during the process.
 * @throws {Error} - Throws an error if the provided link lacks a file extension, has an invalid file extension,
 * or if any other error occurs during the download and save process.
 */
async function fileUp(link, fileDir) {
  try {
    if (!link) {
      return null;
    }

    const extIndex = link.lastIndexOf('.');
    if (extIndex === -1) {
      throw new Error('Link does not contain a file extension.');
    }

    const ext = link.substring(extIndex + 1);
    if (!ALLOWED_EXTENSIONS.includes(ext.toLowerCase())) {
      throw new Error('Invalid file extension.');
    }

    const fileName = uuid() + '.' + ext;
    const buffer = await fs.promises.readFile(link);
    const filePath = path.join(fileDir, fileName);

    await fs.promises.writeFile(filePath, buffer);

    return fileName;
  } catch (error) {
    console.error('Error in fileUp:', error);
    throw error;
  }
}

/**
 * Asynchronous function to remove multiple files.
 *
 * @param {object[]} files - An array of file objects to remove.
 * @param {string} files[].location - The relative location of each file.
 * @returns {Promise<boolean>} - A Promise that resolves to true if all files are removed successfully, or false on error.
 */
async function rmFiles(files, fileDir) {
  try {
    await Promise.all(files.map(async ({ location }) => {
      const filePath = path.join(fileDir, location);
      await fs.promises.unlink(filePath);
      console.log(`File removed: ${path.basename(filePath)}`);
      return;
    }));
    return true;
  } catch (error) {
    console.error('Error removing files:', error);
    return false;
  }
};

module.exports = { rmFiles, fileUp, ALLOWED_EXTENSIONS };