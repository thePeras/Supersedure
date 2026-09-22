<template>
  <div v-if="false" />
</template>
<script lang="ts">
import _ from 'lodash'
import { DataModules } from '@/store/DataModules'
import Vue from 'vue'
import { mapActions, mapState } from 'vuex'
import rawLog from '@bksLogger'

const log = rawLog.scope('DataManager')

export default Vue.extend({
  data: () => ({
    interval: null,
  }),
  mounted() {
    this.mountAndRefresh()
    this.$store.commit('storeInitialized', true)
    this.interval = setInterval(this.poll, this.$bksConfig.general.workspaceSyncInterval)
  },
  beforeDestroy() {
    if (this.interval) clearInterval(this.interval);
    DataModules.forEach((module) => {
      if (this.$store.hasModule(module.path)) {
        this.$store.unregisterModule(module.path)
      }
    })

  },

  computed: {
    ...mapState(['usedConfig']),
    ...mapState('tabs', {'activeTab': 'active'}),
    importantTabStuff() {
      if (!this.activeTab) return []

      return [
        this.activeTab.unsavedText,
        this.activeTab.filters,
        this.activeTab.title,
      ]
    }

  },
  watch: {
    importantTabStuff: {
      deep: true,
      handler() {
        this.saveTab()
        _.debounce(this.saveTab, 2000)
      }
    }
  },
  methods: {
    ...mapActions(['initializeConnectionTree', 'initializeQueryTree']),
    saveTab: _.debounce(function() {
      this.$store.dispatch('tabs/save', this.activeTab)
    }, 500),
    poll() {
      DataModules.forEach((module) => {
        if (this.$store.hasModule(module.path)) {
          this.$store.dispatch(`${module.path}/poll`)
        }
      })
    },
    mountAndRefresh() {
      DataModules.forEach((module) => {
        const choice = module.local
        if (!choice) throw new Error(`No module defined for ${module.path}`)
        log.info("DataManager checking", module.path)
        if (this.$store.hasModule(module.path)) {
          log.info("DataManager --> unregistering", module.path)
          this.$store.unregisterModule(module.path)
        }
        log.info("DataManager --> registering", module.path)
        this.$store.registerModule(module.path, choice)
        this.$store.dispatch(`${module.path}/initialize`)
      })

      this.initializeConnectionTree()
      this.initializeQueryTree()
    },
  }
})
</script>
