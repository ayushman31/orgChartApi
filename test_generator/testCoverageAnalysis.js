const fs = require("fs");
const path = require("path");
const axios = require("axios");

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "mistral";

function readTestFiles() {
  const files = ["test/test_generated.cc", "test/test_controllers.cc"];
  const testFiles = [];
  
  for (const file of files) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf-8");
      testFiles.push({ path: file, content });
    }
  }
  
  return testFiles;
}

function calculateCoverage(testOutput) {
  const lines = testOutput.split('\n');
  let totalTests = 0;
  let passedTests = 0;
  
  for (const line of lines) {
    if (line.includes('DROGON_TEST')) {
      totalTests++;
      if (line.includes('PASSED') || line.includes('OK')) {
        passedTests++;
      }
    }
  }
  
  return {
    totalTests,
    passedTests,
    coverage: totalTests > 0 ? (passedTests / totalTests) * 100 : 0
  };
}

function buildPrompt(testFiles, coverage, instruction) {
  let prompt = `${instruction}\n\nTEST COVERAGE RESULTS:\n${JSON.stringify(coverage, null, 2)}\n\nTEST FILES:\n`;
  
  testFiles.forEach(({ path, content }) => {
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

function saveImprovedTests(response) {
  const codeBlocks = [...response.matchAll(/```cpp\s*([\s\S]*?)```/g)];
  const outputDir = "improved_tests";
  
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  codeBlocks.forEach((match, idx) => {
    const content = match[1].trim();
    const filePath = path.join(outputDir, `improved_${idx + 1}.cpp`);
    fs.writeFileSync(filePath, content, "utf-8");
  });
  
  fs.writeFileSync(path.join(outputDir, "coverage_analysis.md"), response);
}

async function main() {
  const testOutput = process.argv[2] || "";
  const testFiles = readTestFiles();
  const coverage = calculateCoverage(testOutput);
  const instruction = fs.readFileSync("coverage_instruction.yaml", "utf-8");
  
  console.log(`Coverage: ${coverage.passedTests}/${coverage.totalTests} (${coverage.coverage.toFixed(1)}%)`);
  
  const prompt = buildPrompt(testFiles, coverage, instruction);
  const response = await callOllama(prompt);
  
  saveImprovedTests(response);
  console.log("Coverage analysis complete. Check improved_tests/ directory.");
}

main().catch(console.error); 