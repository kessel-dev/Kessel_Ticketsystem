# Power Platform ALM

The repository separates the authoring source from the deployable solution:

- `canvas-sync/` is the only working directory for Canvas app YAML.
- `src/solutions/Ticketsystem/` is the unpacked DEV solution used for builds and deployments.
- Canvas YAML changes are not added to the solution package until they are intentionally published to DEV and the export workflow is run.

## GitHub Environments

Create the GitHub Environments `DEV`, `TEST`, and `PROD`. Configure required reviewers for `PROD` so production imports require approval.

Secrets for each environment:

| Name          | Purpose                        |
| ------------- | ------------------------------ |
| `PP_USERNAME` | Power Platform deployment user |
| `PP_PASSWORD` | Deployment user password       |

Variables for each environment:

| Name                                       | Solution schema name or purpose             |
| ------------------------------------------ | ------------------------------------------- |
| `PP_ENVIRONMENT_URL`                       | Target Dataverse environment URL            |
| `PP_EV_SP_SITE`                            | `kse_ev_sp_site`                            |
| `PP_EV_SP_LIB_TICKET_ATTACHMENTS`          | `kse_ev_sp_lib_ticket_attachments`          |
| `PP_EV_SP_LIST_COMMENTS`                   | `kse_ev_sp_list_comments`                   |
| `PP_EV_SP_LIST_CONFIG_DROPDOWN`            | `kse_ev_sp_list_config_dropdown`            |
| `PP_EV_SP_LIST_CONFIG_MEMBERS`             | `kse_ev_sp_list_config_members`             |
| `PP_EV_SP_LIST_CONFIG_SAVED_VIEWS`         | `kse_ev_sp_list_config_saved_views`         |
| `PP_EV_SP_LIST_CONFIG_TRANSITION_REQUESTS` | `kse_ev_sp_list_config_transition_requests` |
| `PP_EV_SP_LIST_CONFIG_TRANSITIONS`         | `kse_ev_sp_list_config_transitions`         |
| `PP_EV_SP_LIST_CONFIG_TRANSLATIONS`        | `kse_ev_sp_list_config_translations`        |
| `PP_EV_SP_LIST_NOTIFICATIONS`              | `kse_ev_sp_list_notifications`              |
| `PP_EV_SP_LIST_SERVICE_CATALOG`            | `kse_ev_sp_list_service_catalog`            |
| `PP_EV_SP_LIST_SERVICE_REQUEST_ANSWERS`    | `kse_ev_sp_list_service_request_answers`    |
| `PP_EV_SP_LIST_SERVICEFIELD_DEFINITIONS`   | `kse_ev_sp_list_servicefield_definitions`   |
| `PP_EV_SP_LIST_SERVICEFIELD_OPTIONS`       | `kse_ev_sp_list_servicefield_options`       |
| `PP_EV_SP_LIST_TICKETS`                    | `kse_ev_sp_list_tickets`                    |
| `PP_CONNECTION_OUTLOOK_ID`                 | Outlook connection ID                       |
| `PP_CONNECTION_SHAREPOINT_ID`              | SharePoint connection ID                    |
| `PP_CONNECTION_TEAMS_ID`                   | Teams connection ID                         |

The optional repository variable `PP_SOLUTION_NAME` defaults to `Ticketsystem`. `PP_DEV_URL` remains a supported repository-level fallback for the DEV export workflow.

## Workflows

`Export Power Platform Solution` runs manually on `main`. It exports DEV as unmanaged and managed ZIPs, unpacks both into a dual source folder, verifies both package types, stores the ZIP artifacts, and commits source changes back to `main`.

`Build Power Platform Solution` runs when solution source changes on `main` and can also run manually. It always creates the unmanaged ZIP and creates the managed ZIP after the first dual DEV export, without connecting to an environment.

`Deploy Power Platform Solution` runs manually for `TEST` or `PROD`. It requires the dual source, validates every target value, creates and populates `out/deployment-settings.json` with PAC CLI, packs a managed solution, verifies target authentication, and imports with the generated settings.

Run the DEV export once after introducing the workflows and before the first TEST or PROD deployment. SolutionPackager cannot convert an unmanaged-only source into a managed package.

The generated settings file is not committed. Deployment stops before authentication or import when any target value is missing or malformed.
