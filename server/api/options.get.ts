import { totalmem } from "os"

export default defineEventHandler(async (_event) => {
  const memory = totalmem()
  return {
    memory: Math.floor(memory / 1024 / 1024) /* convert to MB */
  }
})
