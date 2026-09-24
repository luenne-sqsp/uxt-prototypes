<script setup>
import { RouterView } from 'vue-router';
import VariantMenu from './components/VariantMenu.vue';
import { useCatalogStore } from './stores/catalog.js';

// Fired eagerly, same as c3_c1's top-level window._ACUITY_TEMPLATES_READY
// (index.html:8260) — S3's chips and S5's suggestions both read from this.
useCatalogStore().load();
</script>

<template>
  <RouterView />
  <VariantMenu />
</template>
