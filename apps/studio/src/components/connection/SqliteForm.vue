<template>
  <div class="sqlite-form">
    <div class="host-port-user-password">
      <div class="row gutter">
        <div class="col form-group">
          <label
            for="Database"
            required
          >Database File</label>
          <file-picker
            v-model="config.defaultDatabase"
            input-id="Database"
            editable
            show-create-button
          />

          <platform-warning location="database-file" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import SettingsInput from '../common/SettingsInput.vue'
import { mapGetters, mapState } from 'vuex'
import ToggleFormArea from '../common/ToggleFormArea.vue'
import FilePicker from '../common/form/FilePicker.vue'
import PlatformWarning from './PlatformWarning.vue'
export default Vue.extend({
  props: {
    config: Object,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  components: {
    SettingsInput,
    ToggleFormArea,
    FilePicker,
    PlatformWarning
  },
  data() {
    return {
      loadExtensionFileType: this.$config.isMac ? "dylib" : this.$config.isWindows ? "dll" : "so"
    }
  },
  computed: {
    ...mapGetters('settings', { 'sqliteRuntimeExtensions': 'sqliteRuntimeExtensions' }),
    extensionChosen() {
      return this.extensions && this.extensions?.length > 0
    },
    extensions() {
      return this.sqliteRuntimeExtensions?.value
    },
    runtimeExtensionsEnabled() {
      return this.$bksConfig.security.allowRuntimeExtensions
    }
  },
  methods: {
    async unloadExtension(toRemove: string) {
      let value = this.sqliteRuntimeExtensions?.value
      value = value.filter((v) => v !== toRemove);
      await this.$store.dispatch('settings/save', { key: 'sqliteExtensionFile', value })
    },
    async loadExtension() {
      let file = this.$native.dialog.showOpenDialogSync({
        properties: ['openFile']
      });

      if (Array.isArray(file)) file = file[0]

      let value = this.sqliteRuntimeExtensions?.value
      value.push(file)
      await this.$store.dispatch('settings/save', { key: 'sqliteExtensionFile', value })
    }
  }
})
</script>
