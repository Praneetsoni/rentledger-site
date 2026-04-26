// Canonical entity URIs for @id cross-referencing across the schema graph.
// Per SEO-PLAYBOOK §11.7: every reference to an entity uses these stable IDs
// so Knowledge Graph resolves all mentions to the same node.

export const SCHEMA_IDS = {
  organization: "https://rentledger.org/#organization",
  website: "https://rentledger.org/#website",
  person: "https://rentledger.org/#person",
  mobileApplication: "https://rentledger.org/#mobile-app",
} as const;

export const SITE_URL = "https://rentledger.org";
export const APP_STORE_URL =
  "https://apps.apple.com/us/app/rentledger-rental-expense-log/id6761083476";
export const TWITTER_URL = "https://twitter.com/praneets21";
