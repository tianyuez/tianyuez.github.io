import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const directory = "src/publications";
fs.mkdirSync(directory, { recursive: true });
const files = fs.readdirSync(directory).filter(file => file.endsWith(".md"));
const errors = [];
for (const file of files) {
  const source = fs.readFileSync(path.join(directory, file), "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) { errors.push(`${file}: missing YAML front matter`); continue; }
  const data = yaml.load(match[1]);
  for (const field of ["title", "authors", "venue", "year", "type", "tag", "role"]) {
    if (data[field] === undefined || data[field] === "") errors.push(`${file}: missing ${field}`);
  }
  if (data.role !== undefined && !["First Author", "Co-first Author", "Corresponding Author", "First & Corresponding Author", "Co-author"].includes(data.role)) {
    errors.push(`${file}: invalid role '${data.role}'`);
  }
}

const site = yaml.load(fs.readFileSync("src/_data/site.yaml", "utf8"));
const selected = site.selectedPublications || [];
if (selected.length !== 5) errors.push(`site.yaml: selectedPublications must contain exactly 5 papers`);
for (const [index, publication] of selected.entries()) {
  for (const field of ["title", "authors", "venue", "year", "tag", "role"]) {
    if (publication[field] === undefined || publication[field] === "") errors.push(`site.yaml: selectedPublications[${index}] is missing ${field}`);
  }
  if (!["First Author", "Corresponding Author", "First & Corresponding Author"].includes(publication.role)) {
    errors.push(`site.yaml: selectedPublications[${index}] must be first-author or corresponding-author work`);
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${files.length} local publication records and ${selected.length} selected publications.`);
