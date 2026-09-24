<script setup>
import { computed } from 'vue';
import { useVariantStore } from '../stores/variants.js';

const props = defineProps({ name: { type: String, required: true } });
defineOptions({ inheritAttrs: false });

const store = useVariantStore();
const component = computed(() => store.slotComponent(props.name));

if (import.meta.env.DEV) {
  const declared = store.currentScreen?.slots ?? [];
  if (!declared.includes(props.name)) {
    console.warn(
      `[VariantSlot] "${props.name}" rendered on screen "${store.screenId}" but isn't listed in its manifest "slots" — the variant menu won't show it.`,
    );
  }
}
</script>

<template>
  <component :is="component" v-bind="$attrs">
    <template v-for="(_, slotName) in $slots" #[slotName]="scope" :key="slotName">
      <slot :name="slotName" v-bind="scope ?? {}" />
    </template>
  </component>
</template>
