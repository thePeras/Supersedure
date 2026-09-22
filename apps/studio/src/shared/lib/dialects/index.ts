import { RedshiftData } from "@shared/lib/dialects/redshift";
import { BigQueryData } from "./bigquery";
import { Dialect, DialectData } from "./models";
import { MysqlData } from "./mysql";
import { PostgresData } from "./postgresql";
import { GreengageData } from "./greengage";
import { SqliteData } from "./sqlite";
import { SqlServerData } from "./sqlserver";
import { RedisData } from "@shared/lib/dialects/redis";
import { StarRocksData } from "./starrocks";

export function getDialectData(dialect: Dialect): DialectData  {
  switch (dialect) {
    case "postgresql":
      return PostgresData
    case "greengage":
      return GreengageData
    case "mysql":
      return MysqlData
    case "sqlserver":
      return SqlServerData
    case "sqlite":
      return SqliteData
    case 'redshift':
      return RedshiftData
    case 'bigquery':
      return BigQueryData
    case 'redis':
      return RedisData
    case 'starrocks':
      return StarRocksData
    default:
      return SqliteData
  }
}
