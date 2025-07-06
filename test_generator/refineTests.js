const fs = require("fs");
const path = require("path");
const axios = require("axios");
const yaml = require("js-yaml");

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "mistral";

// Read existing test files
function getExistingTests(testsDir = "tests") {
  let testFiles = [];
  if (!fs.existsSync(testsDir)) {
    console.log(`⚠️  Directory ${testsDir} not found`);
    return [];
  }

  for (const file of fs.readdirSync(testsDir)) {
    if (file.endsWith(".cpp") || file.endsWith(".cc")) {
      const fullPath = path.join(testsDir, file);
      const content = fs.readFileSync(fullPath, "utf-8");
      testFiles.push({ path: fullPath, content });
    }
  }
  return testFiles;
}

// Build refinement prompt
function buildRefinementPrompt(testFiles, refinementInstruction) {
  let prompt = `
You are an expert in C++ testing. Below are the refinement instructions:

\`\`\`yaml
${refinementInstruction}
\`\`\`

Here are the existing tests that need refinement:
`;

  for (const { path, content } of testFiles) {
    prompt += `\n--- EXISTING TEST FILE: ${path} ---\n\`\`\`cpp\n${content}\n\`\`\`\n`;
  }

  prompt += `\nPlease refine these tests according to the instructions above and output the complete improved test file.`;

  return prompt;
}

// Send to Ollama
async function callOllama(prompt) {
  const response = await axios.post(OLLAMA_URL, {
    model: MODEL,
    prompt,
    stream: false,
  });
  return response.data.response;
}

// Save refined tests
function saveRefinedTests(response, outputDir = "refined_tests") {
  const codeBlocks = [...response.matchAll(/```cpp\s*([\s\S]*?)```/g)];
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  codeBlocks.forEach((match, idx) => {
    const content = match[1].trim();
    const filePath = path.join(outputDir, `refined_test_${idx + 1}.cpp`);
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✅ Refined test file written: ${filePath}`);
  });
}

async function main() {
  const testFiles = getExistingTests("tests");
  
  if (testFiles.length === 0) {
    console.error("❌ No existing tests found to refine!");
    return;
  }

  const refinementInstruction = fs.readFileSync("refinement_instruction.yaml", "utf-8");

  const prompt = buildRefinementPrompt(testFiles, refinementInstruction);

  console.log("🔧 Refining tests with Mistral via Ollama...");
  const response = await callOllama(prompt);

  saveRefinedTests(response);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
}); 