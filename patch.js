const fs = require("fs").promises;
const path = require("path");

async function modifyFile(inputFile, replacementFile) {
  try {
    // 1. Calculate the number of bytes in the input file
    const inputStats = await fs.stat(inputFile);
    const originalSize = inputStats.size;
    console.log(`Original file size: ${originalSize} bytes`);

    // Read the content of the input file
    let inputContent = await fs.readFile(inputFile, "utf8");

    // 2. Find the line containing "mkdir tmp-googleapis" and get the offset of the next line
    const lines = inputContent.split("\n");
    let targetLineIndex = lines.findIndex((line) =>
      line.includes("mkdir tmp-googleapis")
    );

    if (targetLineIndex === -1) {
      throw new Error(
        'The line containing "mkdir tmp-googleapis" was not found.'
      );
    }

    const offset = lines.slice(0, targetLineIndex + 2).join("\n").length;
    console.log(`Offset of the line after "mkdir tmp-googleapis": ${offset}`);

    // 3. Replace the content after the offset with the content of the replacement file
    const replacementContent = await fs.readFile(replacementFile, "utf8");
    inputContent = inputContent.slice(0, offset) + "\n" + replacementContent;

    // 4. Add spaces to maintain the original file size
    const currentSize = Buffer.byteLength(inputContent, "utf8");
    const paddingSize = originalSize - currentSize;

    if (paddingSize < 0) {
      throw new Error("The new content is larger than the original file size.");
    }

    const padding = " ".repeat(paddingSize);
    inputContent += padding;

    // Write the modified content back to the input file
    await fs.writeFile(inputFile, inputContent);
    console.log("File successfully modified.");
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

// Check if the correct number of arguments is provided
if (process.argv.length !== 4) {
  console.log("Usage: node script.js <input_file> <replacement_file>");
  process.exit(1);
}

const inputFile = process.argv[2];
const replacementFile = process.argv[3];

modifyFile(inputFile, replacementFile);
