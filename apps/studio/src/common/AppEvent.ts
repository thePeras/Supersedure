import Vue from "vue"
import rawLog from '@bksLogger'

const log = rawLog.scope('AppEvent')

export enum AppEvent {
  menuClick = 'menu-click',
  settingsChanged = "sc-refresh",
  newTab = 'nt',
  /** Create a new custom tab. First argument is `TransportOpenTab`. */
  newCustomTab = 'nct',
  closeTab = 'ct',
  closeAllTabs = 'close_all_tabs',
  disconnect = 'dc',
  supersedureAdded = 'bkadd',
  openExternally = 'oe',
  togglePrimarySidebar = 'ts',
  toggleSecondarySidebar = 'toggleSecondarySidebar',
  selectSecondarySidebarTab = 'selectSecondarySidebarTab',
  beginExport = 'be',
  createTable = 'new_table',
  openTableProperties = 'loadTableProperties',
  loadTable = 'loadTable',
  loadSelectTop = 'loadSelectTop',
  quickSearch = 'quickSearch',
  promptLogin = 'cloud_signin',
  promptCreateWorkspace = 'cloud_create_workspace',
  promptRenameWorkspace = 'cloud_rename_workspace',
  promptDeleteWorkspace = 'cloud_delete_workspace',
  promptQueryImport = 'cloud_q_import',
  promptQueryExport = 'q_export',
  promptConnectionImport = 'cloud_c_import',
  promptSqlFilesImport = 'q_files_import',
  promptConnectionFilesImport = 'c_files_import',
  openAddFieldModal = 'add_field_modal',
  hideEntity = 'hideEntity',
  hideSchema = 'hideSchema',
  toggleHideEntity = 'toggleHideEntity',
  toggleHideSchema = 'toggleHideSchema',
  setDatabaseElementName = 'setDatabaseElementName',
  deleteDatabaseElement = 'deleteDatabaseElement',
  dropDatabaseElement = 'dropDatabaseElement',
  duplicateDatabaseTable = 'duplicateDatabaseTable',
  /** Triggered when a lifetime (expired subscription) license tries to use cloud workspaces */
  cloudWorkspacesBlocked = 'cloudWorkspacesBlocked',
  toggleExpandTableList = 'toggleExpandTableList',
  togglePinTableList = 'togglePinTableList',
  dropzoneEnter = 'dropzoneEnter',
  dropzoneDrop = 'dropzoneDrop',
  createConfirmModal = 'createConfirmModal',
  showConfirmModal = 'showConfirmModal',
  /** Triggered when the license valid date or support date has expired */
  licenseExpired = 'licenseExpired',
  /** Triggered when the license valid date has expired */
  licenseValidDateExpired = 'licenseValidDateExpired',
  /** Triggered when the license support date has expired */
  licenseSupportDateExpired = 'licenseSupportDateExpired',
  toggleBeta = 'toggleBeta',
  switchUserKeymap = 'switchUserKeymap',
  openPluginManager = 'openPluginManager',
  openKeyboardShortcuts = 'openKeyboardShortcuts',
  /** A tab is about to be switched. First argument is the tab. */
  switchingTab = 'switchingTab',
  /** A tab has been switched. First argument is the tab. */
  switchedTab = 'switchedTab',
  /** A tab is about to be closed. First argument is the tab. */
  closingTab = 'closingTab',
  simulatePlatform = 'simulatePlatform',
  updatePin = 'updatePin',
  /** The theme has been changed. */
  changedTheme = 'changedTheme',
  /** A plugin menu item was clicked in the native/client menu under the tools. */
  pluginMenuClicked = 'pluginMenuClicked',
  /** Open query edit history on a new / existing query tab.
   * @example
   * this.trigger(AppEvent.openQueryEditHistory, savedQueryId);
   **/
  openQueryEditHistory = 'openQueryEditHistory',
  /** Paste clipboard contents as new rows in the active table's Data tab. */
  pasteAsNewRows = 'pasteAsNewRows',
  /** Open a modal to move a connection or a saved query to a folder
   * @example
   * this.trigger(AppEvent.openMoveFileModal, {
   *   type: "connection",
   *   value: this.config, // the connection config
   * });
   **/
  openMoveFileModal = 'openMoveFileModal',
  /** Open a modal to move a folder to another folder
   * @example
   * this.trigger(AppEvent.openMoveFolderModal, {
   *   type: "connectionFolder",
   *   value: item, // the folder
   * });
   **/
  openMoveFolderModal = 'openMoveFolderModal',
  /** Open the connection type picker. Do not call this directly. Please use `this.$promptConnectionType()`. */
  openConnectionTypePickerModal = 'openConnectionTypePickerModal',
  /** Vim's `:w`. Broadcast, so only the active tab should act on it. */
  vimWrite = 'vimWrite',
  /** Vim's `:x` and `:wq`. Broadcast, so only the active tab should act. */
  vimWriteQuit = 'vimWriteQuit',
}

export interface RootBinding {
  event: string
  handler(arg: any): void
}


export const AppEventMixin = Vue.extend({
  methods:  {
    registerHandlers(bindings: RootBinding[]) {
      bindings.forEach(({ event, handler }) => {
        this.$root.$on(event, handler)
      })
    },
    unregisterHandlers(bindings: RootBinding[]) {
      bindings.forEach(({ event, handler }) => {
        this.$root.$off(event, handler)
      })
    },
    trigger(event: AppEvent, ...args: any) {
      log.debug('trigger', event, args)
      this.$root.$emit(event.toString(), ...args)
    }
  }

})
