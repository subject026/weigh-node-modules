#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const colors = require("colors");
const spinners = require("cli-spinners");

// const rootDir = process.env.NODE_ENV === "dev" ? __dirname : process.cwd();
const rootDir = process.cwd();

// if (!rootDir) throw new Error("No root directory specified!!");

// 1. scan file structure and get all full /node_modules file paths into an array

const nmPathsArray = [];
let allNmFiles = [];

const getNodeModulesPaths = (currentDir) => {
  const files = fs.readdirSync(currentDir);
  files.forEach((file, i) => {
    if (fs.statSync(path.join(currentDir, file)).isDirectory()) {
      // if it;s a nm folder add it to the array.
      if (file === "node_modules") {
        const parentFolder = currentDir.split(rootDir)[1];
        process.stdout.write(
          colors.white("found ") + path.join(parentFolder, file) + "\n"
        );
        nmPathsArray.push(path.join(currentDir, file));
      } else {
        // if it's some other folder look inside it
        getNodeModulesPaths(path.join(currentDir, file), nmPathsArray);
      }
    }
  });
};

/**
 * Gets all file paths within a directory recursively. Use to measure size of node_modules folders.
 * @param {*} dirPath
 * @param {*} filesArray
 */

const getAllFiles = (dirPath, filesArray) => {
  filesArray = filesArray || [];

  const files = fs.readdirSync(dirPath);
  // process.stdout.write(".");

  files.forEach((file, i) => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      filesArray = getAllFiles(path.join(dirPath, file), filesArray);
    } else {
      // console.log(i);
      // if (i % 10000 === 0) process.stdout.write(".");
      filesArray.push(path.join(dirPath, file));
    }
  });

  return filesArray;
};

//
// Let's go!

console.log(
  colors.rainbow("\nSearching ") +
    colors.white("/" + rootDir.split("/")[rootDir.split("/").length - 1]) +
    " for node_modules folders...\n"
);

getNodeModulesPaths(rootDir);

//
// Calculate total size

process.stdout.write("\nCalculating total size...\n\n");

nmPathsArray.forEach((path) => {
  allNmFiles = [...allNmFiles, ...getAllFiles(path)];
});

let totalSize = 0;

allNmFiles.forEach((file) => {
  totalSize += fs.statSync(file).size;
});

process.stdout.write(colors.white("\ntotal size is "));
process.stdout.write(colors.green(Math.round(totalSize / 1024 / 1024)));
process.stdout.write(colors.brightWhite(" MB\n\n"));

// 2. read all
