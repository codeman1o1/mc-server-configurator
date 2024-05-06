import si from "systeminformation"

export default defineEventHandler(async (_event) => {
  const memory = await si.mem()
  return {
    memory: Math.floor(memory.total / 1024 / 1024) /* convert to MB */
  }
})
