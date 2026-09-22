<template>
  <div class="with-connection-type">
    <div class="form-group col">
      <label for="authenticationType">Authentication Method</label>
      <select name="" v-model="authType" id="" :disabled="disabled">
        <option :key="`${t.value}-${t.name}`" v-for="t in authTypes" :value="t.value" :selected="authType === t.value">
          {{ t.name }}
        </option>
      </select>
    </div>
    <div class="row gutter" v-if="jwtAuthEnabled">
      <div class="alert alert-info">
        <i class="material-icons-outlined">info</i>
        <div>
          Paste a CockroachDB JWT into the JWT Token field. Supersedure will send it as the password and add the required Cockroach JWT startup option for this connection. Save Passwords is turned off by default so you can paste a fresh token next time.
        </div>
      </div>
    </div>
    <common-server-inputs
      v-show="showServerInputs"
      :config="config"
      :show-password-form="showPasswordForm"
      :password-label="passwordLabel"
      :disabled="disabled"
    />

    <div class="form-group" v-if="isCockroach">
      <label for="Cluster ID">
        CockroachDB Cloud Cluster ID
        <i
          class="material-icons"
          v-tooltip="`Go to CockroachDB online -> Connect -> parameters only -> copy from 'options'`"
        >help_outlined</i>
      </label>
      <input type="text" class="form-control" v-model="config.options.cluster" :disabled="disabled">
    </div>
    <common-advanced :config="config" :disabled="disabled" />
  </div>
</template>

<script>

import CommonServerInputs from './CommonServerInputs.vue'
import CommonAdvanced from './CommonAdvanced.vue'
import _ from "lodash";

const COCKROACH_JWT = 'cockroach-jwt'

function initialAuthType(config) {
  if (config.connectionType === 'cockroachdb') {
    return config.options?.jwtAuthEnabled ? COCKROACH_JWT : 'default'
  }
  return 'default'
}

export default {
  components: { CommonServerInputs, CommonAdvanced },
  props: {
    config: Object,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    if (!this.isCockroach && this.authType !== 'default') {
      this.showPasswordForm = false;
    }
  },
  data() {
    return {
      authType: initialAuthType(this.config),
      signingOut: false,
      errorSigningOut: null,
      showPasswordForm: true
    }
  },
  watch: {
    isCockroach() {
      if(this.isCockroach) {
        this.authType = this.config.options?.jwtAuthEnabled ? COCKROACH_JWT : 'default'
      } else {
        this.authType = initialAuthType(this.config)
      }
    },
    async authType() {
      if (this.isCockroach) {
        const isJwt = this.authType === COCKROACH_JWT
        this.config.options = {
          ...(this.config.options || {}),
          jwtAuthEnabled: isJwt,
        }
        if (isJwt) this.config.rememberPassword = false
        this.showPasswordForm = true
        return
      }

      this.showPasswordForm = true
    },
    config() {
      this.authType = initialAuthType(this.config)
    },
  },
  computed: {
    isCockroach() {
      return this.config.connectionType === 'cockroachdb'
    },
    showServerInputs() {
      return true
    },
    authTypes() {
      if (this.isCockroach) {
        return [
          { name: 'Username / Password', value: 'default' },
          { name: 'JWT', value: COCKROACH_JWT },
        ]
      }
      return [
        { name: 'Username / Password', value: 'default' },
      ]
    },
    jwtAuthEnabled() {
      return this.isCockroach && this.authType === COCKROACH_JWT
    },
    passwordLabel() {
      return this.jwtAuthEnabled ? 'JWT Token' : 'Password'
    }
  }
};
</script>
