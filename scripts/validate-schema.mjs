import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(__dirname, "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8"));
}

function formatError(error) {
  const location = error.instancePath || "/";
  return `${location} ${error.message}`;
}

function validateCollection({ schemaPath, dataPath, label }) {
  const schema = readJson(schemaPath);
  const records = readJson(dataPath);
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  for (const [index, record] of records.entries()) {
    if (validate(record)) continue;
    const details = validate.errors?.map(formatError).join("; ") || "unknown schema error";
    throw new Error(`${label} record ${index} (${record?.id || "missing-id"}) failed schema validation: ${details}`);
  }
}

validateCollection({
  schemaPath: "schema/site.schema.json",
  dataPath: "data/sites.json",
  label: "site"
});

validateCollection({
  schemaPath: "schema/youtube-channel.schema.json",
  dataPath: "data/youtube-channels.json",
  label: "YouTube channel"
});

console.log(
  JSON.stringify(
    {
      ok: true,
      schemas: ["schema/site.schema.json", "schema/youtube-channel.schema.json"]
    },
    null,
    2
  )
);
