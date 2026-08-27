import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const environmentVariables = [
  ["kse_ev_sp_site", "PP_EV_SP_SITE"],
  ["kse_ev_sp_lib_ticket_attachments", "PP_EV_SP_LIB_TICKET_ATTACHMENTS"],
  ["kse_ev_sp_list_comments", "PP_EV_SP_LIST_COMMENTS"],
  ["kse_ev_sp_list_config_dropdown", "PP_EV_SP_LIST_CONFIG_DROPDOWN"],
  ["kse_ev_sp_list_config_members", "PP_EV_SP_LIST_CONFIG_MEMBERS"],
  ["kse_ev_sp_list_config_saved_views", "PP_EV_SP_LIST_CONFIG_SAVED_VIEWS"],
  [
    "kse_ev_sp_list_config_transition_requests",
    "PP_EV_SP_LIST_CONFIG_TRANSITION_REQUESTS",
  ],
  ["kse_ev_sp_list_config_transitions", "PP_EV_SP_LIST_CONFIG_TRANSITIONS"],
  ["kse_ev_sp_list_config_translations", "PP_EV_SP_LIST_CONFIG_TRANSLATIONS"],
  ["kse_ev_sp_list_notifications", "PP_EV_SP_LIST_NOTIFICATIONS"],
  ["kse_ev_sp_list_service_catalog", "PP_EV_SP_LIST_SERVICE_CATALOG"],
  [
    "kse_ev_sp_list_service_request_answers",
    "PP_EV_SP_LIST_SERVICE_REQUEST_ANSWERS",
  ],
  [
    "kse_ev_sp_list_servicefield_definitions",
    "PP_EV_SP_LIST_SERVICEFIELD_DEFINITIONS",
  ],
  ["kse_ev_sp_list_servicefield_options", "PP_EV_SP_LIST_SERVICEFIELD_OPTIONS"],
  ["kse_ev_sp_list_tickets", "PP_EV_SP_LIST_TICKETS"],
];

const connectionReferences = [
  ["kse_cnref_outlook_ticketsystem", "PP_CONNECTION_OUTLOOK_ID"],
  ["kse_cnref_sharepoint", "PP_CONNECTION_SHAREPOINT_ID"],
  ["kse_cnref_teams_ticketsystem", "PP_CONNECTION_TEAMS_ID"],
];

const requiredNames = [
  ...environmentVariables.map(([, environmentName]) => environmentName),
  ...connectionReferences.map(([, environmentName]) => environmentName),
];
const values = Object.fromEntries(
  requiredNames.map((name) => [name, process.env[name]?.trim() ?? ""]),
);
const missingNames = requiredNames.filter((name) => !values[name]);

if (missingNames.length > 0) {
  console.error(`Missing deployment variables: ${missingNames.join(", ")}`);
  process.exit(1);
}

let siteUrl;
try {
  siteUrl = new URL(values.PP_EV_SP_SITE);
} catch {
  console.error("PP_EV_SP_SITE must be a valid URL.");
  process.exit(1);
}

if (siteUrl.protocol !== "https:") {
  console.error("PP_EV_SP_SITE must use HTTPS.");
  process.exit(1);
}

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const invalidGuidNames = environmentVariables
  .slice(1)
  .map(([, environmentName]) => environmentName)
  .filter((name) => !guidPattern.test(values[name]));

if (invalidGuidNames.length > 0) {
  console.error(
    `Expected SharePoint GUIDs for: ${invalidGuidNames.join(", ")}`,
  );
  process.exit(1);
}

const outputPath = resolve(process.argv[2] ?? "out/deployment-settings.json");
let settings;
try {
  settings = JSON.parse(await readFile(outputPath, "utf8"));
} catch (error) {
  console.error(
    `Cannot read the PAC deployment settings template: ${error.message}`,
  );
  process.exit(1);
}

const environmentNameBySchema = new Map(environmentVariables);
const connectionNameByLogicalName = new Map(connectionReferences);
const templateEnvironmentNames = new Set(
  settings.EnvironmentVariables?.map(({ SchemaName }) => SchemaName) ?? [],
);
const templateConnectionNames = new Set(
  settings.ConnectionReferences?.map(({ LogicalName }) => LogicalName) ?? [],
);
const missingSchemas = environmentVariables
  .map(([schemaName]) => schemaName)
  .filter((schemaName) => !templateEnvironmentNames.has(schemaName));
const missingConnections = connectionReferences
  .map(([logicalName]) => logicalName)
  .filter((logicalName) => !templateConnectionNames.has(logicalName));
const unexpectedSchemas = [...templateEnvironmentNames].filter(
  (schemaName) => !environmentNameBySchema.has(schemaName),
);
const unexpectedConnections = [...templateConnectionNames].filter(
  (logicalName) => !connectionNameByLogicalName.has(logicalName),
);

if (
  missingSchemas.length > 0 ||
  missingConnections.length > 0 ||
  unexpectedSchemas.length > 0 ||
  unexpectedConnections.length > 0
) {
  console.error(
    [
      "PAC template does not match the deployment mapping.",
      `Missing schemas: ${missingSchemas.join(", ") || "none"}.`,
      `Missing connections: ${missingConnections.join(", ") || "none"}.`,
      `Unexpected schemas: ${unexpectedSchemas.join(", ") || "none"}.`,
      `Unexpected connections: ${unexpectedConnections.join(", ") || "none"}.`,
    ].join(" "),
  );
  process.exit(1);
}

for (const variable of settings.EnvironmentVariables) {
  const environmentName = environmentNameBySchema.get(variable.SchemaName);
  if (environmentName) {
    variable.Value = values[environmentName];
  }
}

for (const connection of settings.ConnectionReferences) {
  const environmentName = connectionNameByLogicalName.get(
    connection.LogicalName,
  );
  if (environmentName) {
    connection.ConnectionId = values[environmentName];
  }
}

await writeFile(outputPath, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
console.log(
  `Populated ${outputPath} with ${environmentVariables.length} environment variables and ${connectionReferences.length} connection references.`,
);
