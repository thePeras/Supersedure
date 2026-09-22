import { UtilConnectionFolderModule } from "@/store/modules/data/connection_folder/UtilityConnectionFolderModule";
import { UtilQueryFolderModule } from "@/store/modules/data/query_folder/UtilityQueryFolderModule";
import { UtilConnectionModule } from "./modules/data/connection/UtilityConnectionModule";
import { UtilQueryModule } from "./modules/data/query/UtilityQueryModule";
import { UtilQueryAuditModule } from "./modules/data/query_audit/UtilityQueryAuditModule";
import { UtilUsedConnectionModule } from "./modules/data/used_connection/UtilityUsedConnectionModule";
import { UtilUsedQueryModule } from "./modules/data/used_query/UtilityUsedQueryModule";

export const DataModules = [
  { path: 'data/queries', local: UtilQueryModule },
  { path: 'data/queryAudits', local: UtilQueryAuditModule },
  { path: 'data/connections', local: UtilConnectionModule },
  { path: 'data/queryFolders', local: UtilQueryFolderModule },
  { path: 'data/connectionFolders', local: UtilConnectionFolderModule },
  { path: 'data/usedQueries', local: UtilUsedQueryModule },
  { path: 'data/usedconnections', local: UtilUsedConnectionModule },
]
