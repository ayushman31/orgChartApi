const fs = require("fs");
const path = require("path");
const axios = require("axios");

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "mistral";

function readBuildLogs(buildDir = "../build") {
  const logs = {};
  const logFiles = ["build_log.txt", "CMakeError.log"];
  
  for (const logFile of logFiles) {
    const logPath = path.join(buildDir, logFile);
    if (fs.existsSync(logPath)) {
      logs[logFile] = fs.readFileSync(logPath, "utf-8");
    }
  }
  
  return logs;
}

function readSourceFiles() {
  const files = ["test/test_generated.cc", "CMakeLists.txt", "test/CMakeLists.txt"];
  const sourceFiles = [];
  
  for (const file of files) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf-8");
      sourceFiles.push({ path: file, content });
    }
  }
  
  return sourceFiles;
}

function buildPrompt(buildLogs, sourceFiles, instruction) {
  let prompt = `${instruction}\n\nBUILD LOGS:\n`;
  
  Object.entries(buildLogs).forEach(([filename, content]) => {
    prompt += `\n--- ${filename} ---\n${content}\n`;
  });

  prompt += `\nSOURCE FILES:\n`;
  sourceFiles.forEach(({ path, content }) => {
    prompt += `\n--- ${path} ---\n\`\`\`cpp\n${content}\n\`\`\`\n`;
  });

  return prompt;
}

async function callOllama(prompt) {
  const response = await axios.post(OLLAMA_URL, {
    model: MODEL,
    prompt,
    stream: false,
  });
  return response.data.response;
}

function saveFixedFiles(response) {
  const codeBlocks = [...response.matchAll(/```cpp\s*([\s\S]*?)```/g)];
  const outputDir = "fixed_build";
  
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  codeBlocks.forEach((match, idx) => {
    const content = match[1].trim();
    const filePath = path.join(outputDir, `fixed_${idx + 1}.cpp`);
    fs.writeFileSync(filePath, content, "utf-8");
  });
  
  fs.writeFileSync(path.join(outputDir, "analysis.md"), response);
}

async function main() {
  const buildLogs = readBuildLogs();
  const sourceFiles = readSourceFiles();
  const instruction = fs.readFileSync("build_failure_instruction.yaml", "utf-8");
  
  const prompt = buildPrompt(buildLogs, sourceFiles, instruction);
  const response = await callOllama(prompt);
  
  saveFixedFiles(response);
  console.log("Build failure analysis complete. Check fixed_build/ directory.");
}

main().catch(console.error); 