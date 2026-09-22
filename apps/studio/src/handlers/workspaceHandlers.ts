import { promises as fs } from 'fs';
import { IObjectImportStats } from "@/common/interfaces/IObjectImportStats";
import { QueryImporter } from "@/backend/lib/objectimport/query";
import { ConnectionImporter } from "@/backend/lib/objectimport/connection";
import rawLog from "@bksLogger";

const log = rawLog.scope('workspaceHandlers')


export interface IWorkspaceHandlers {
  "workspace/importQueryDirectory": ({ sId, dir, parentId, preserveRoot }: { sId: string, dir: string, parentId: number, preserveRoot: boolean }) => Promise<IObjectImportStats>,
  "workspace/importQueries": ({ sId, paths, parentId }: { sId: string, paths: string[], parentId: number }) => Promise<IObjectImportStats>,
  "workspace/importConnectionsDirectory": ({ sId, dir, parentId, preserveRoot }: { sId: string, dir: string, parentId: number, preserveRoot: boolean }) => Promise<IObjectImportStats>,
  "workspace/importConnections": ({ sId, paths, parentId }: { sId: string, paths: string[], parentId: number }) => Promise<IObjectImportStats>
}

export const WorkspaceHandlers: IWorkspaceHandlers = {
  'workspace/importQueryDirectory': async function({ dir, parentId, sId, preserveRoot }: { dir: string, parentId: number, sId: string, preserveRoot: boolean }): Promise<IObjectImportStats> {
    if (typeof dir !== 'string' || dir.length === 0) {
      throw new Error('workspace/importDirectory called with no directory path')
    }

    const stat = await fs.stat(dir);
    if (!stat.isDirectory()) {
      throw new Error('workspace/importDirectory called with non directory path');
    }

    const importer = new QueryImporter();

    const stats = await importer.importDirectory(dir, parentId, preserveRoot);

    return stats;
  },
  'workspace/importQueries': async function({ sId, paths, parentId }: { sId: string, paths: string[], parentId: number }): Promise<IObjectImportStats> {
    const importer = new QueryImporter();

    const stats = await importer.importSelections(paths, parentId);

    return stats;
  },
  'workspace/importConnectionsDirectory': async function({ dir, parentId, sId, preserveRoot }: { dir: string, parentId: number, sId: string, preserveRoot: boolean }): Promise<IObjectImportStats> {
    if (typeof dir !== 'string' || dir.length === 0) {
      throw new Error('workspace/importConnectionsDirectory called with no directory path')
    }

    const stat = await fs.stat(dir);
    if (!stat.isDirectory()) {
      throw new Error('workspace/importConnectionsDirectory called with non directory path');
    }

    const importer = new ConnectionImporter();

    const stats = await importer.importDirectory(dir, parentId, preserveRoot);

    return stats;
  },
  'workspace/importConnections': async function({ sId, paths, parentId }: { sId: string, paths: string[], parentId: number }): Promise<IObjectImportStats> {
    const importer = new ConnectionImporter();
    log.info("paths: ", paths);

    const stats = await importer.importSelections(paths, parentId);

    return stats;
  }
}
