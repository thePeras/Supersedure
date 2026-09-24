import rawLog from '@bksLogger'
import helpers from '@shared/lib/tabulator'
import { CellComponent } from 'tabulator-tables';
import { TabulatorFormatterParams } from '@/common/tabulator';
import { TableFilter, TableOrView } from '@/lib/db/models';

const log = rawLog.scope('fk_click');

export interface FkTarget {
  table: TableOrView
  filters: TableFilter[]
  values: any[]
}

export interface FkTargetContext {
  tables: TableOrView[]
  connection: any
}

/** Figure out which table and row a foreign key cell points at. */
export async function resolveFkTarget(
  rawKeyData: any,
  cell: CellComponent,
  { tables, connection }: FkTargetContext
): Promise<FkTarget> {
  const fromColumn = cell.getField().replace(/-link--bks$/g, "")

  if (!rawKeyData) {
    log.error("fk-click, couldn't find key data. Please open an issue. fromColumn:", fromColumn)
    throw new Error("Unable to open foreign key. See dev console")
  }

  let tableName = rawKeyData.toTable
  let schemaName = rawKeyData.toSchema
  // Handle both regular and composite foreign keys
  let columnName = rawKeyData.isComposite ?
    rawKeyData.toColumn.join(',') :
    rawKeyData.toColumn

  let table = tables.find(t => {
    return (!schemaName || schemaName === t.schema) && t.name === tableName
  })

  if (tableName && columnName && !schemaName && !table) {
    // might be schema/table instead of table/column, we should check.
    const sn = tableName
    const tn = columnName
    table = tables.find(t => {
      return t.schema === sn && t.name === tn
    })

    if (table) {
      schemaName = sn
      tableName = tn
      columnName = undefined
    }
  }

  if (!table) {
    log.error("fk-click: unable to find destination table", tableName)
    throw new Error(`Table link: unable to find destination table '${tableName}'`)
  }

  if (!columnName) {
    // just assume it's the primary key
    columnName = await connection.getPrimaryKey(tableName, schemaName)
  }

  const filters: TableFilter[] = [];

  // Handle source column(s) - might be composite keys
  const FromColumnKeys = rawKeyData.isComposite ?
    rawKeyData.fromColumn :
    fromColumn.split(',');

  // Handle target column(s)
  const ToColumnKeys = columnName.split(',');
  const values = [];

  ToColumnKeys.forEach((key: string, index: number) => {
    // Get the appropriate cell for this column from the foreign key
    const sourceColumnName = FromColumnKeys[index] || fromColumn;
    const valueCell = cell.getRow().getCell(sourceColumnName);

    if (!valueCell) {
      log.error(`fk-click: unable to find source column cell for '${sourceColumnName}'`);
      return;
    }

    const params: TabulatorFormatterParams = valueCell.getColumn().getDefinition().formatterParams || {}
    let value = valueCell.getValue()

    if (value instanceof Uint8Array) {
      const encoding = (params.binaryEncoding || 'hex') as 'hex' | 'base64'
      value = helpers.niceString(value, false, encoding)
    }

    values.push(value);
    filters.push({
      value,
      type: '=',
      field: key
    });
  });

  return { table, filters, values }
}

export const FkLinkMixin = {
  methods: {

    // TODO: merge in community, get keyData changes, integrate here
    // check out TableTable first
    fkColumn(column, keyDatas) {
      const keyWidth = 40
      const icon = () => "<i class='material-icons fk-link'>launch</i>"
      const tooltip = () => {
        if (keyDatas.length == 1) {
          if (keyDatas[0].isComposite) {
            const cols = keyDatas[0].toColumn.join(', ');
            return `View record in ${keyDatas[0].toTable} (${cols})`;
          } else {
            return `View record in ${keyDatas[0].toTable}`;
          }
        } else {
          return `View records in ${(keyDatas.map(item => item.toTable).join(', ') as string).replace(/, (?![\s\S]*, )/, ', or ')}`;
        }
      }
      const clickMenu = [];
      if (keyDatas.length > 1) {
        keyDatas.forEach(x => {
          clickMenu.push({
            label: `<x-menuitem><x-label>${x.toTable}(${x.isComposite ? x.toColumn.join(', ') : x.toColumn})</x-label></x-menuitem>`,
            action: (_e, cell) => {
              this.fkClick(x, cell);
            }
          })
        })
      }

      const fkClick = (_e, cell) => this.fkClick(keyDatas[0], cell)

      const keyResult = {
        headerSort: false,
        download: false,
        width: keyWidth,
        resizable: false,
        field: (keyDatas[0].fromColumn ?? column.field) + '-link--bks',
        title: "",
        cssClass: "foreign-key-button",
        cellClick: clickMenu.length === 0 ? fkClick : null,
        formatter: icon,
        clickMenu,
        tooltip
      }
      column.cssClass = 'foreign-key'
      return keyResult
    },

    async fkClick(rawKeyData, cell: CellComponent) {
      log.debug('fk click', rawKeyData)

      let target: FkTarget
      try {
        target = await resolveFkTarget(rawKeyData, cell, {
          tables: this.$store.state.tables,
          connection: this.$store.state.connection,
        })
      } catch (e) {
        this.$noty.error(e.message)
        return
      }

      this.$root.$emit('loadTable', {
        table: target.table,
        filters: target.filters,
        titleScope: target.values.join(','),
      })
    },

  }
}
