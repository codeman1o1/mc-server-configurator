// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@nuxt/eslint"],
  imports: {
    dirs: ["types"]
  },
  compatibilityDate: "2025-04-23",
  devtools: {
    enabled: true
  }
})
