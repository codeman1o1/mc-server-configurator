import Docker from "dockerode"
import { normalize } from "pathe"

const docker = new Docker({
  socketPath:
    process.env.DOCKER_SOCKET ||
    (process.platform === "win32"
      ? String.raw`\\.\pipe\docker_engine`
      : "/var/run/docker.sock")
})

export default defineEventHandler(async (event) => {
  const { general, world, advanced } = await readBody(event)
  const { server_name, platform, version } = general
  const {
    difficulty,
    gamemode,
    hardcore,
    gamerules,
    view_distance,
    simulation_distance,
    level_type,
    seed
  } = world
  const {
    pvp,
    spawn_animals,
    spawn_monsters,
    spawn_npcs,
    spawn_protection,
    enable_command_blocks
  } = gamerules
  const { port, binding, memory } = advanced

  await docker.pull("itzg/minecraft-server")
  const container = await docker.createContainer({
    name: (server_name as string).toLowerCase().replace(/\s/g, "-"),
    Image: "itzg/minecraft-server",
    OpenStdin: true,
    Tty: true,
    Env: [
      "EULA=TRUE",
      `SERVER_NAME=${server_name}`,
      `TYPE=${platform.toUpperCase()}`,
      `VERSION=${version}`,
      `DIFFICULTY=${difficulty.toLowerCase()}`,
      `MODE=${gamemode.toLowerCase()}`,
      `HARDCORE=${hardcore}`,
      `PVP=${pvp}`,
      `SPAWN_ANIMALS=${spawn_animals}`,
      `SPAWN_MONSTERS=${spawn_monsters}`,
      `SPAWN_NPCS=${spawn_npcs}`,
      `SPAWN_PROTECTION=${spawn_protection}`,
      `ENABLE_COMMAND_BLOCK=${enable_command_blocks}`,
      `VIEW_DISTANCE=${view_distance}`,
      `SIMULATION_DISTANCE=${simulation_distance}`,
      `LEVEL_TYPE=${level_type.toLowerCase()}`,
      ...(seed ? [`SEED=${seed}`] : []),
      `MEMORY=${memory !== 0 ? memory : (await $fetch("/api/options")).memory - 1 * 1024}M`,
      `USE_AIKAR_FLAGS=true`
    ],
    Labels: {
      "me.codeman1o1.mc-server-configurator": server_name
    },
    HostConfig: {
      PortBindings: {
        "25565/tcp": [{ HostPort: port.toString() }]
      },
      ...(binding ? { Binds: [`${normalize(binding)}:/data`] } : {}),
      Memory: memory * 1024 * 1024 /* convert to bytes */
    }
  })
  await container.start()
  return container.id
})
