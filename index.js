#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const rootDir = process.env.NODE_ENV === "dev" ? __dirname : process.cwd();

if (!rootDir) throw new Error("No root directory specified!!");

// 1. scan file structure and get all full /node_modules file paths into an array

const nmPathsArray = [];
let allNmFiles = [];

const getNodeModulesPaths = (currentDir) => {
  const files = fs.readdirSync(currentDir);
  files.forEach((file, i) => {
    if (fs.statSync(path.join(currentDir, file)).isDirectory()) {
      // if it;s a nm folder add it to the array.
      if (file === "node_modules") {
        nmPathsArray.push(path.join(rootDir, currentDir, file));
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

  files.forEach((file) => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      filesArray = getAllFiles(path.join(dirPath, file), filesArray);
    } else {
      filesArray.push(path.join(dirPath, file));
    }
  });

  return filesArray;
};

// files = getAllFiles(rootDir);

getNodeModulesPaths(rootDir);

nmPathsArray.forEach((path) => {
  allNmFiles = [...allNmFiles, ...getAllFiles(path)];
});

let totalSize = 0;

allNmFiles.forEach((file) => {
  totalSize += fs.statSync(file).size;
});

console.log("total size is ", totalSize / 1024 / 1024, "MB");

// 2. read all
