import fs from "node:fs";
import yaml from "js-yaml";

const token = process.env.GITHUB_TOKEN;
const source = yaml.load(fs.readFileSync("src/_data/site.yaml", "utf8"));
const outputFile = "src/_data/translations.json";
const translations = JSON.parse(fs.readFileSync(outputFile, "utf8"));
const skipKeys = new Set(["url", "email", "photo", "code"]);
const strings = new Set();

function collect(value, key = "") {
  if (skipKeys.has(key)) return;
  if (typeof value === "string" && value.length > 2 && !/^https?:|^\//.test(value)) strings.add(value);
  else if (Array.isArray(value)) value.forEach(item => collect(item, key));
  else if (value && typeof value === "object") Object.entries(value).forEach(([childKey, child]) => collect(child, childKey));
}
collect(source);
const missing = [...strings].filter(value => !translations[value]);

if (!missing.length) {
  console.log("Chinese translation cache is current.");
  process.exit(0);
}
if (!token) {
  console.log(`GITHUB_TOKEN is unavailable; keeping the cache and ${missing.length} English fallbacks.`);
  process.exit(0);
}

for (let index = 0; index < missing.length; index += 30) {
  const batch = missing.slice(index, index + 30);
  const response = await fetch("https://models.github.ai/inference/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-4.1-mini",
      temperature: 0,
      messages: [
        { role: "system", content: "Translate academic website text from English to concise Simplified Chinese. Preserve personal names, paper titles, course codes, URLs, venue abbreviations, and established institution names. Return only a valid JSON object whose keys are the exact input strings and values are translations." },
        { role: "user", content: JSON.stringify(batch) }
      ]
    })
  });
  if (!response.ok) throw new Error(`GitHub Models translation failed: HTTP ${response.status}`);
  const result = await response.json();
  const text = result.choices?.[0]?.message?.content?.replace(/^```json\s*|\s*```$/g, "");
  Object.assign(translations, JSON.parse(text));
}

fs.writeFileSync(outputFile, `${JSON.stringify(translations, null, 2)}\n`, "utf8");
console.log(`Added ${missing.length} server-side Chinese translations.`);
