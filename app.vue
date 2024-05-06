<template>
  <Head>
    <Title>
      {{ minceraft ? "Minceraft" : "Minecraft" }} Server Configurator
    </Title>
  </Head>
  <UNotifications />
  <NuxtPage />
</template>

<script setup lang="ts">
const minceraft = Math.random() < 0.0001
</script>
