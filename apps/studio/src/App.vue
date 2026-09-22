<template>
  <div class="style-wrapper" :style="{ '--bks-text-editor-font-size': `${editorFontSize}px` }">
    <div
      class="supersedure-studio-wrapper"
      :class="{ 'supersedure-studio-minimal-mode': $store.getters.minimalMode }"
    >
      <titlebar />
      <template v-if="storeInitialized">
        <!-- TODO (@day): need to come up with a better way to check this. Just set a 'connected' flag? -->
        <connection-interface v-if="!connected" />
        <core-interface
          @databaseSelected="databaseSelected"
          v-else
        />
        <auto-updater />
        <notification-manager />
      </template>
    </div>
    <portal-target
      name="modals"
      multiple
    />
    <dropzone />
    <data-manager />
    <configuration-warning-modal />
    <connection-files-import-modal />
    <plugin-controller :editor-font-size="editorFontSize" />
    <plugin-manager-modal />
    <keyboard-shortcuts-modal />
    <move-item-modal />
    <move-folder-modal />
    <connection-type-picker-modal />
    <confirmation-modal-manager />
    <lock-manager />
    <input-ephemeral-modal name="input-ephemeral-modal" />
    <util-died-modal />
    <portal-target
      name="menus"
      multiple
      class="portal-target-menus"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters, mapState } from 'vuex'
import Titlebar from './components/Titlebar.vue'
import CoreInterface from './components/CoreInterface.vue'
import ConnectionInterface from './components/ConnectionInterface.vue'
import AutoUpdater from './components/AutoUpdater.vue'
import DataManager from './components/common/DataManager.vue'
import querystring from 'query-string'
import ConfigurationWarningModal from '@/components/ConfigurationWarningModal.vue'

import TimeAgo from 'javascript-time-ago'
import { AppEvent } from './common/AppEvent'
import globals from './common/globals'
import NotificationManager from './components/NotificationManager.vue'
import Noty from 'noty';
import ConfirmationModalManager from '@/components/common/modals/ConfirmationModalManager.vue'
import Dropzone from '@/components/Dropzone.vue'
import UtilDiedModal from '@/components/UtilDiedModal.vue'
import { SmartLocalStorage } from '@/common/LocalStorage';
import PluginManagerModal from '@/components/plugins/PluginManagerModal.vue'
import KeyboardShortcutsModal from '@/components/common/modals/KeyboardShortcutsModal.vue'
import PluginController from '@/components/plugins/PluginController.vue'
import LockManager from "@/components/managers/LockManager.vue";
import InputEphemeralModal from "@/components/common/modals/InputEphemeralModal.vue";
import MoveItemModal from "@/components/common/modals/MoveItemModal.vue";
import MoveFolderModal from "@/components/common/modals/MoveFolderModal.vue";
import ConnectionFilesImportModal from '@/components/common/modals/ConnectionFilesImportModal.vue'
import ConnectionTypePickerModal from "@/components/common/modals/ConnectionTypePickerModal.vue";

import rawLog from '@bksLogger'
import { assignContextMenuToAllInputs } from './mixins/assignContextMenuToAllInputs'

const log = rawLog.scope('app.vue')

export default Vue.extend({
  name: 'App',
  mixins: [assignContextMenuToAllInputs],
  components: {
    CoreInterface, ConnectionInterface, Titlebar, AutoUpdater, NotificationManager,
    DataManager, ConfirmationModalManager, Dropzone,
    UtilDiedModal,
    PluginManagerModal, ConfigurationWarningModal, PluginController, LockManager, KeyboardShortcutsModal,
    InputEphemeralModal, MoveItemModal, MoveFolderModal,
    ConnectionFilesImportModal, ConnectionTypePickerModal,
  },
  data() {
    return {
      url: null,
      interval: null,
      runningWayland: false,
    }
  },
  computed: {
    ...mapState(['storeInitialized', 'connected', 'database']),
    ...mapGetters({
      'themeValue': 'settings/themeValue',
    }),
    editorFontSize() {
      return this.$store.state.settings?.settings?.editorFontSize?.value || 14
    }
  },
  watch: {
    database() {
      log.info('database changed', this.database)
    },
    themeValue() {
      document.body.className = `theme-${this.themeValue}`
      this.trigger(AppEvent.changedTheme, this.themeValue)
    },
  },
  async beforeDestroy() {
    clearInterval(this.interval)
  },
  async mounted() {
    const query = querystring.parse(window.location.search, { parseBooleans: true })
    if (query) {
      this.url = query.url || null
      this.runningWayland = !!query.runningWayland
    }


    this.$nextTick(() => {
      window.main.isReady();
    })
    if (this.themeValue) {
      document.body.className = `theme-${this.themeValue}`
    }

    if (this.url) {
      try {
        const { auth, cancelled  } = await this.$bks.unlock();
        if (cancelled) return;
        await this.$store.dispatch('openUrl', { url: this.url, auth })
      } catch (error) {
        console.error(error)
        this.$noty.error(`Error opening ${this.url}: ${error}`)
        throw error
      }
    }

  },
  methods: {
    databaseSelected(_db) {
      // TODO: do something here if needed
    },
  }
})
</script>

<style scoped>
.portal-target-menus::v-deep > * {
  z-index: 99999;
}

</style>
