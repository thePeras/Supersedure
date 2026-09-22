<template>
  <span class="database-icon">
    <svg
      v-if="icon && typeof icon === 'object'"
      viewBox=" 0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      :aria-label="icon.title"
    >
      <path :d="icon.path" :fill="`#${icon.hex}`" />
    </svg>
    <img v-else-if="icon" :src="icon" :alt="type" />
    <i v-else class="material-icons-outlined default-icon">table_rows</i>
  </span>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import {
  siCockroachlabs,
  siGooglebigquery,
  siMariadb,
  type SimpleIcon,
  siMysql,
  siPostgresql,
  siRedis,
  siSqlite,
  siTidb,
} from "simple-icons";
import sqlserver from "devicon/icons/microsoftsqlserver/microsoftsqlserver-original.svg";
import { ConnectionType } from "@/lib/db/types";

type DevIcon = string;

const icons: Record<ConnectionType, SimpleIcon | DevIcon | null> = {
  bigquery: siGooglebigquery,
  cockroachdb: siCockroachlabs,
  mariadb: siMariadb,
  mysql: siMysql,
  postgresql: siPostgresql,
  redis: siRedis,
  sqlite: siSqlite,
  tidb: siTidb,
  sqlserver,
  bedrock: null,
  greengage: null,
  redshift: null,
  starrocks: null,
};

export default Vue.extend({
  props: {
    type: {
      type: String as PropType<ConnectionType>,
      required: true,
    },
  },
  computed: {
    icon() {
      return icons[this.type] ?? null;
    },
  },
});
</script>

<style lang="scss" scoped>
svg,
img,
i.default-icon {
  width: 1em;
  height: 1em;
}

i.default-icon {
  font-size: 1em;
  color: hsl(from var(--theme-base) h s calc(l + 80));
}
</style>
