// Kept in sync with the backend's src/jobs/skills_taxonomy.py by hand - same list, so
// the skill-gap view and resume matcher here line up with the JD frequency counts
// computed there.
export const SKILLS = [
  "DataWeave", "Transform Message", "RAML", "OAS", "API-led connectivity",
  "API-led", "Anypoint Studio", "Anypoint Platform", "CloudHub", "Runtime Fabric",
  "MUnit", "Object Store", "Anypoint MQ", "VM queue", "Batch job", "Scatter-Gather",
  "Choice router", "APIKit", "Error handling", "Try scope", "On Error Continue",
  "On Error Propagate", "Circuit breaker", "Reconnection strategy",
  "Property encryption", "Secure properties", "OAuth", "JWT", "Client ID enforcement",
  "Rate limiting", "API Manager", "API policies", "SFTP", "FTP connector",
  "Salesforce connector", "Database connector", "HTTP connector", "Flow design",
  "Sub-flow", "Idempotent", "DLQ", "Dead letter queue", "CI/CD", "Jenkins",
  "Maven", "Git", "Bitbucket", "Munit test", "Logging", "Correlation ID",
  "Mule 4", "Mule ESB", "Integration patterns", "Microservices", "REST API",
  "SOAP", "Web service", "XML to JSON", "Data transformation", "Design Center",
];

// Maps a skill to the chapter(s) that cover it, by keyword match on chapter title -
// used by the skill-gap view to say "you've covered this" vs "not yet".
const CHAPTER_KEYWORDS: Record<string, string[]> = {
  "DataWeave": ["dataweave"], "Transform Message": ["dataweave"],
  "RAML": ["api-led", "raml"], "OAS": ["api-led", "raml"],
  "API-led connectivity": ["api-led"], "API-led": ["api-led"],
  "Anypoint Studio": ["environment setup", "first mule"], "Anypoint Platform": ["anypoint platform"],
  "CloudHub": ["scaling", "deploying"], "Runtime Fabric": ["scaling"],
  "MUnit": ["munit", "testing"], "Object Store": ["object store"],
  "Anypoint MQ": ["anypoint mq"], "VM queue": ["anypoint mq"],
  "Batch job": ["scaling"], "Scatter-Gather": ["routers"], "Choice router": ["routers"],
  "APIKit": ["routers"], "Error handling": ["error and exception"],
  "Try scope": ["error and exception"], "On Error Continue": ["error and exception"],
  "On Error Propagate": ["error and exception"], "Circuit breaker": ["circuit breaker"],
  "Reconnection strategy": ["circuit breaker"], "Property encryption": ["securing sensitive"],
  "Secure properties": ["securing sensitive"], "OAuth": ["securing apis"],
  "JWT": ["securing apis"], "Client ID enforcement": ["securing apis"],
  "Rate limiting": ["securing apis"], "API Manager": ["securing apis"],
  "API policies": ["securing apis"], "SFTP": ["file, ftp"], "FTP connector": ["file, ftp"],
  "Salesforce connector": ["real-world project"], "Database connector": ["data formats"],
  "HTTP connector": ["http basics"], "Flow design": ["first mule"], "Sub-flow": ["first mule"],
  "Idempotent": ["real-world project"], "DLQ": ["anypoint mq"], "Dead letter queue": ["anypoint mq"],
  "CI/CD": ["git, bitbucket"], "Jenkins": ["git, bitbucket"], "Maven": ["git, bitbucket"],
  "Git": ["git, bitbucket"], "Bitbucket": ["git, bitbucket"], "Munit test": ["munit"],
  "Logging": ["logging, debugging"], "Correlation ID": ["logging, debugging"],
  "Mule 4": ["error and exception"], "Mule ESB": ["introduction to mulesoft"],
  "Integration patterns": ["introduction to mulesoft"], "Microservices": ["introduction to mulesoft"],
  "REST API": ["http basics"], "SOAP": ["http basics"], "Web service": ["http basics"],
  "XML to JSON": ["data formats"], "Data transformation": ["dataweave"],
  "Design Center": ["api-led"],
};

export function coveredChapters(skill: string, chapterNames: string[]): string[] {
  const keywords = CHAPTER_KEYWORDS[skill] ?? [];
  return chapterNames.filter((name) =>
    keywords.some((kw) => name.toLowerCase().includes(kw)),
  );
}

export function matchesSkill(text: string, skill: string): boolean {
  return text.toLowerCase().includes(skill.toLowerCase());
}

const HTML_ENTITIES: Record<string, string> = {
  "&lt;": "<", "&gt;": ">", "&amp;": "&", "&quot;": '"', "&#39;": "'", "&nbsp;": " ",
};

// Greenhouse (and others) return job descriptions as HTML, sometimes with entities
// double-encoded - strip tags and decode entities so excerpts read as plain text.
function stripHtml(text: string): string {
  let decoded = text;
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    decoded = decoded.replaceAll(entity, char);
  }
  return decoded.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// Splits text into sentences and returns the ones mentioning the skill - real JD
// context instead of just a mention count, capped per-source since one JD can repeat
// a skill many times and we only need one representative sentence from it.
export function extractExcerpts(text: string, skill: string, maxPerSource = 2): string[] {
  if (!text) return [];
  const clean = stripHtml(text);
  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15 && s.length < 400);

  const needle = skill.toLowerCase();
  const matches = sentences.filter((s) => s.toLowerCase().includes(needle));
  return matches.slice(0, maxPerSource);
}
