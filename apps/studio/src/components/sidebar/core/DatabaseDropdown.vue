<template>
  <div class="fixed">
    <div class="data-select-wrap" :class="{'disabled-db-dropdown': isRefreshing}">
      <p
        v-if="!supportsMultipleDatabases"
        class="sqlite-db-name"
        :title="selectedDatabase"
      >
        {{ selectedDatabase }}
      </p>
      <v-select
        v-else
        :title="'Database: ' + selectedDatabase"
        v-model="selectedDatabase"
        :options="availableDatabases"
        :components="{OpenIndicator}"
        placeholder="Select a database..."
        class="dropdown-search"
      />
      <div class="db-actions">
        <a
          v-if="supportsMultipleDatabases"
          class="refresh"
          @click.prevent="refreshDatabases"
          :title="'Refresh Databases'"
        >
          <i class="material-icons" :class="{'refreshing-db-icon': isRefreshing }">{{ isRefreshing ? 'sync' : 'refresh' }}</i>
        </a>
        <a
          v-if="!usedConfig?.readOnlyMode && supportsAddDatabase"
          class="refresh"
          @click.prevent="$modal.show('config-add-database')"
          :title="'Add Database'"
        >
          <i class="material-icons">add</i>
        </a>
      </div>
    </div>
    <portal to="modals">
      <modal
        class="vue-dialog supersedure-modal save-add-database"
        name="config-add-database"
        height="auto"
        :scrollable="true"
      >
        <!-- TODO: Make sure one of the elements in this modal is focused so that the keyboard trap works -->
        <div
          class="dialog-content"
          v-kbd-trap="true"
        >
          <add-database-form
            @databaseCreated="databaseCreated"
            @cancel="$modal.hide('config-add-database')"
          />
        </div>
      </modal>
    </portal>
  </div>
</template>

<script type="text/javascript">
  import _ from 'lodash'
  import vSelect from 'vue-select'
  import {AppEvent} from '@/common/AppEvent'
  import AddDatabaseForm from "@/components/connection/AddDatabaseForm.vue"
  import { mapActions, mapState, mapGetters } from 'vuex'

  export default {
    props: [ ],
    data() {
      return {
        selectedDatabase: null,
        isRefreshing: false,
        OpenIndicator: {
          render: createElement => createElement('i', {class: {'material-icons': true}}, 'arrow_drop_down')
        }
      }
    },
    components: {
      vSelect,
      AddDatabaseForm
    },
    methods: {
      ...mapActions({updateDatabaseList: 'updateDatabaseList'}),
      async refreshDatabases() {
        if (this.isRefreshing) {
          return
        }
        this.isRefreshing = true
        try {
          await this.updateDatabaseList()
        } finally {
          this.isRefreshing = false
        }
      },
      async databaseCreated(db) {
        this.$modal.hide('config-add-database')
        if (this.dialect.disabledFeatures?.multipleDatabases) {
          const fileLocation = this.selectedDatabase.split('/')
          fileLocation.pop()
          const url = this.connectionType === 'sqlite' ? `${fileLocation.join('/')}/${db}.db` : `${fileLocation.join('/')}/${db}`
          return window.main.send(AppEvent.menuClick, 'newWindow', { url })
        }
        await this.refreshDatabases()
        this.selectedDatabase = db
      },
    },
    async mounted() {
      this.selectedDatabase = this.currentDatabase
    },
    computed: {
      supportsMultipleDatabases() {
        return !this.dialectData.disabledFeatures?.multipleDatabases
      },
      supportsAddDatabase() {
        return !this.dialectData.disabledFeatures?.addDatabase
      },
      availableDatabases() {
        return _.without(this.dbs, this.selectedDatabase)
      },
      ...mapGetters(['dialect', 'dialectData']),
      ...mapState({currentDatabase: 'database', dbs: 'databaseList', connectionType: 'connectionType', usedConfig: 'usedConfig'}),
    },
    watch: {
      currentDatabase(newValue) {
        if (this.selectedDatabase !== newValue) {
          this.selectedDatabase = newValue
        }
      },
      selectedDatabase() {
        if (this.selectedDatabase != this.currentDatabase && this.dbs.includes(this.selectedDatabase)) {
          this.$emit('databaseSelected', this.selectedDatabase)
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

  .data-select-wrap {
    position: relative;

    .db-actions {
      position: absolute;
      right: 0;
      display: flex;
      align-items: center;
      padding-right: 0.5rem;
    }

    .dropdown-search {
      width: 100%;
      padding-right: 3.5rem;
    }
  }

  .disabled-db-dropdown {
    pointer-events: none;

    .refreshing-db-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  }

  .sqlite-db-name {
    width: 90%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-left: 0.75rem;
  }

  .external-link {
    text-decoration: underline;
    & :hover {
      text-decoration: none;
    }
  }
</style>
