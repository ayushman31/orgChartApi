const fs = require("fs");
const path = require("path");
const axios = require("axios");
const yaml = require("js-yaml");

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "mistral"; // i am using mistral

// get all .cpp and .h files
function getCppFiles(dir) {
  let files = [];
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(getCppFiles(fullPath));
    } else if (file.endsWith(".cpp") || file.endsWith(".cc") || file.endsWith(".h")) {
      const code = fs.readFileSync(fullPath, "utf-8");
      files.push({ path: fullPath, code });
    }
  }
  return files;
}

// prompt
function buildPrompt(codeFiles, yamlInstruction) {
  let prompt = `
You are an expert in C++ testing.
Below is the YAML instruction file:

\`\`\`yaml
${yamlInstruction}
\`\`\`

Now, generate unit tests for the following code:
`;

  for (const { path, code } of codeFiles) {
    prompt += `\n--- FILE: ${path} ---\n\`\`\`cpp\n${code}\n\`\`\`\n`;
  }

  return prompt;
}

// send to ollama
async function callOllama(prompt) {
  const response = await axios.post(OLLAMA_URL, {
    model: MODEL,
    prompt,
    stream: false,
  });
  return response.data.response;
}

// save output test files
function saveTests(response, outputDir = "tests") {
  const codeBlocks = [...response.matchAll(/```cpp\s*([\s\S]*?)```/g)];
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  codeBlocks.forEach((match, idx) => {
    const content = match[1].trim();
    const filePath = path.join(outputDir, `test_${idx + 1}.cpp`);
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✅ Test file written: ${filePath}`);
  });
}

async function main() {
  const dirs = ["controllers"];
  let codeFiles = [];
  
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      const dirFiles = getCppFiles(dir);
      console.log(`📁 Found ${dirFiles.length} files in ${dir}:`);
      dirFiles.forEach(file => console.log(`   - ${file.path}`));
      codeFiles = codeFiles.concat(dirFiles);
    }
  }

  if (codeFiles.length === 0) {
    console.error("❌ No source files found!");
    
  }

  console.log(`📊 Total files to process: ${codeFiles.length}`);

  const yamlInstruction = fs.readFileSync("instruction.yaml", "utf-8");
  const prompt = buildPrompt(codeFiles, yamlInstruction);

  console.log(`📏 Prompt length: ${prompt.length} characters`);
  console.log("🚀 Sending code to Mistral via Ollama...");
  
  const response = await callOllama(prompt);
  console.log(`📝 Response length: ${response.length} characters`);
  
  saveTests(response);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
});

