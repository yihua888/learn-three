<template>
  <div class="page-root">
    <div class="router-label"></div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.page-root {
  height: 100%;
  background: linear-gradient(rgb(0, 255, 8), rgb(0, 247, 255));
  position: relative;
  .router-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 600px;
    width: 600px;
  }
}
</style>
