<template>
  <div
    v-if="visible"
    ref="popup"
    class="fk-preview"
    :style="style"
  >
    <div class="fk-preview-header">
      <span
        class="fk-preview-table"
        :title="tableLabel"
      >{{ tableLabel }}</span>
    </div>
    <div
      v-if="loading"
      class="fk-preview-message"
    >
      Loading record
    </div>
    <div
      v-else-if="error"
      class="fk-preview-message error"
    >
      {{ error }}
    </div>
    <div
      v-else-if="!fields.length"
      class="fk-preview-message"
    >
      No matching record
    </div>
    <div
      v-else
      class="fk-preview-fields"
    >
      <div
        v-for="field in fields"
        :key="field.name"
        class="fk-preview-field"
      >
        <span
          class="fk-preview-field-name"
          :title="field.name"
        >{{ field.name }}</span>
        <span
          class="fk-preview-field-value"
          :class="{ 'null-value': field.empty }"
          :title="field.value"
        >{{ field.value }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import _ from 'lodash'
import { mapState } from 'vuex'
import { AppEvent } from '@/common/AppEvent'
import { resolveFkTarget } from '@/mixins/fk_click'
import helpers from '@shared/lib/tabulator'
import rawLog from '@bksLogger'

const log = rawLog.scope('FkPreviewPopup')

const SHOW_DELAY = 350
const POPUP_MARGIN = 8
const MAX_VALUE_LENGTH = 200

export default Vue.extend({
  data() {
    return {
      visible: false,
      loading: false,
      error: null,
      tableLabel: '',
      fields: [],
      style: {},
      pending: null,
      anchor: null,
      showTimer: null,
      requestId: 0,
    }
  },
  computed: {
    ...mapState(['tables', 'connection']),
    rootBindings() {
      return [
        { event: AppEvent.showFkPreview, handler: this.handleShow },
        { event: AppEvent.hideFkPreview, handler: this.hide },
      ]
    },
  },
  mounted() {
    this.rootBindings.forEach(({ event, handler }) => this.$root.$on(event, handler))
    window.addEventListener('scroll', this.hide, true)
    window.addEventListener('resize', this.hide)
  },
  beforeDestroy() {
    this.rootBindings.forEach(({ event, handler }) => this.$root.$off(event, handler))
    window.removeEventListener('scroll', this.hide, true)
    window.removeEventListener('resize', this.hide)
    clearTimeout(this.showTimer)
  },
  methods: {
    handleShow(payload) {
      if (this.visible && this.anchor === payload.element) {
        return
      }

      clearTimeout(this.showTimer)
      this.pending = Object.freeze(payload)
      this.showTimer = setTimeout(this.show, SHOW_DELAY)
    },
    hide() {
      clearTimeout(this.showTimer)
      this.showTimer = null
      this.requestId++
      this.visible = false
      this.pending = null
      this.anchor = null
    },
    async show() {
      const context = this.pending
      if (!context) return

      const requestId = ++this.requestId
      this.anchor = context.element
      this.tableLabel = ''
      this.fields = []
      this.error = null
      this.loading = true
      this.visible = true
      this.position()
      this.$nextTick(this.position)

      try {
        const target = await resolveFkTarget(context.keyData, context.cell, {
          tables: this.tables,
          connection: this.connection,
        })
        if (requestId !== this.requestId) return

        this.tableLabel = target.table.schema
          ? `${target.table.schema}.${target.table.name}`
          : target.table.name

        const response = await this.connection.selectTop(
          target.table.name,
          0,
          1,
          [],
          target.filters,
          target.table.schema
        )
        if (requestId !== this.requestId) return

        this.fields = this.buildFields(response)
      } catch (e) {
        if (requestId !== this.requestId) return
        log.error('fk preview failed', e)
        this.error = e.message
      } finally {
        if (requestId === this.requestId) {
          this.loading = false
        }
      }

      this.$nextTick(this.position)
    },
    buildFields(response) {
      const row = response?.result?.[0]
      if (!row) return []

      const names = response.fields?.length
        ? response.fields.map((field) => field.name)
        : Object.keys(row)

      return names.map((name) => ({
        name,
        value: this.formatValue(row[name]),
        empty: _.isNil(row[name]) || row[name] === '',
      }))
    },
    formatValue(value) {
      if (_.isNil(value)) return '(NULL)'
      if (value === '') return '(EMPTY)'
      const encoding = this.$bksConfig.ui.general.binaryEncoding
      const text = helpers.niceString(value, false, encoding).replace(/\n/g, ' ↩ ')
      return _.truncate(text, { length: MAX_VALUE_LENGTH })
    },
    position() {
      if (!this.anchor) return

      const anchorRect = this.anchor.getBoundingClientRect()
      const popup = this.$refs.popup as HTMLElement
      const width = popup?.offsetWidth ?? 0
      const height = popup?.offsetHeight ?? 0

      let left = anchorRect.left
      if (left + width + POPUP_MARGIN > window.innerWidth) {
        left = Math.max(POPUP_MARGIN, window.innerWidth - width - POPUP_MARGIN)
      }

      let top = anchorRect.bottom + POPUP_MARGIN
      if (top + height + POPUP_MARGIN > window.innerHeight) {
        top = Math.max(POPUP_MARGIN, anchorRect.top - height - POPUP_MARGIN)
      }

      this.style = { left: `${left}px`, top: `${top}px` }
    },
  },
})
</script>
