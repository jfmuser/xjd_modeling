<script setup></script>

<template>
  <div class="catalog-table-container">
    <div class="catalog-table-container__catalog">
      <slot name="catalog"></slot>
    </div>
    <div class="catalog-table-container__table">
      <slot name="table"></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
$catalogWidth: 267px;
$gap: 0.1171875rem;
.catalog-table-container {
  height: 100%;
  display: flex;
  gap: $gap;
  &__catalog {
    width: $catalogWidth;
  }
  &__table {
    width: calc(100% - $catalogWidth - $gap);
  }
}
</style>
