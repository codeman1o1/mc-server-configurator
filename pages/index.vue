<template>
  <div class="grid h-screen w-screen items-center justify-center px-3">
    <div class="my-12 space-y-4">
      <header class="space-y-2 text-center">
        <h1 class="text-3xl font-bold">Minecraft Server Configurator</h1>
        <p class="text-gray-500 dark:text-gray-400">
          Set up your Minecraft server with ease.
        </p>
      </header>
      <UForm
        v-if="stage === 1"
        :schema="generalSchema"
        :state="generalState"
        :validate-on="['submit']"
        class="space-y-4"
        @submit="stage++"
      >
        <UFormGroup label="Server Name" name="server_name">
          <UInput
            v-model="generalState.server_name"
            placeholder="Enter server name..."
          />
        </UFormGroup>
        <UFormGroup label="Platform" name="platform">
          <USelectMenu
            v-model="generalState.platform"
            :options="platforms"
            placeholder="Select a platform..."
          />
        </UFormGroup>
        <div class="space-y-1">
          <UFormGroup label="Minecraft Version" name="version">
            <USelectMenu
              v-model="generalState.version"
              :options="
                versions
                  .filter((version) =>
                    showSnapshots === false ? version.type === 'release' : true
                  )
                  .map((version) => version.id)
                  .slice(0, 100)
              "
              searchable
              searchable-placeholder="Search a version..."
              placeholder="Select a version..."
            />
          </UFormGroup>
          <UCheckbox v-model="showSnapshots" label="Show snapshots" />
        </div>
        <UButton type="submit" block>Next</UButton>
      </UForm>
      <UForm
        v-if="stage === 2"
        :schema="worldSchema"
        :state="worldState"
        :validate-on="['submit']"
        class="space-y-4"
        @submit="stage++"
      >
        <UFormGroup label="Difficulty" name="difficulty">
          <USelectMenu
            v-model="worldState.difficulty"
            :options="difficulties"
            placeholder="Select a difficulty..."
          />
        </UFormGroup>
        <UFormGroup label="Gamemode" name="gamemode">
          <USelectMenu
            v-model="worldState.gamemode"
            :options="gamemodes"
            placeholder="Select a gamemode..."
          />
        </UFormGroup>
        <UFormGroup label="Hardcore" name="hardcore">
          <UToggle v-model="worldState.hardcore" />
        </UFormGroup>
        <UFormGroup label="View distance" name="view_distance">
          <URange
            v-model="worldState.view_distance"
            :step="1"
            :min="3"
            :max="32"
          />
          <p class="text-center">{{ worldState.view_distance }} chunks</p>
        </UFormGroup>
        <UFormGroup label="Simulation distance" name="simulation_distance">
          <URange
            v-model="worldState.simulation_distance"
            :step="1"
            :min="3"
            :max="32"
          />
          <p class="text-center">{{ worldState.simulation_distance }} chunks</p>
        </UFormGroup>
        <UFormGroup label="Level type" name="level_type">
          <USelectMenu
            v-model="worldState.level_type"
            :options="level_types"
            placeholder="Select a level type..."
            searchable
            creatable
            show-create-option-when="always"
          />
        </UFormGroup>
        <UFormGroup label="Seed" name="seed" hint="Optional">
          <UInput
            v-model="worldState.seed"
            placeholder="Enter seed (leave empty for random)"
          />
        </UFormGroup>
        <UModal v-model="configureGamerulesModal">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-bold">Configure gamerules</h2>
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-x-mark-20-solid"
                  class="-my-1"
                  @click="configureGamerulesModal = false"
                />
              </div>
            </template>

            <div class="space-y-4">
              <UFormGroup label="PVP" name="gamerules.pvp">
                <UToggle v-model="worldState.gamerules.pvp" />
              </UFormGroup>
              <UFormGroup label="Spawn animals" name="gamerules.spawn_animals">
                <UToggle v-model="worldState.gamerules.spawn_animals" />
              </UFormGroup>
              <UFormGroup
                label="Spawn monsters"
                name="gamerules.spawn_monsters"
              >
                <UToggle v-model="worldState.gamerules.spawn_monsters" />
              </UFormGroup>
              <UFormGroup label="Spawn NPCs" name="gamerules.spawn_npcs">
                <UToggle v-model="worldState.gamerules.spawn_npcs" />
              </UFormGroup>
              <UFormGroup
                label="Spawn protection"
                name="gamerules.spawn_protection"
              >
                <UInput
                  v-model="worldState.gamerules.spawn_protection"
                  type="number"
                  :min="0"
                />
              </UFormGroup>
              <UFormGroup
                label="Enable command blocks"
                name="gamerules.enable_command_blocks"
              >
                <UToggle v-model="worldState.gamerules.enable_command_blocks" />
              </UFormGroup>
            </div>
          </UCard>
        </UModal>
        <UButton
          type="button"
          color="gray"
          variant="solid"
          block
          @click="configureGamerulesModal = true"
        >
          Configure gamerules
        </UButton>
        <div class="space-y-2">
          <UButton type="button" block @click="stage--">Back</UButton>
          <UButton type="submit" block>Next</UButton>
        </div>
      </UForm>
      <UForm
        v-if="stage === 3"
        :schema="advancedSchema"
        :state="advancedState"
        :validate-on="['submit']"
        class="space-y-4"
        @submit="createServer"
      >
        <UFormGroup label="Port" name="port">
          <UInput
            v-model="advancedState.port"
            type="number"
            min="1024"
            max="65535"
            placeholder="Enter port number"
          />
        </UFormGroup>
        <UFormGroup label="Data location" name="binding" hint="Optional">
          <UInput
            v-model="advancedState.binding"
            icon="i-heroicons-folder"
            placeholder="Enter a valid path"
          />
        </UFormGroup>
        <UFormGroup label="Available Memory" name="memory">
          <URange
            v-model="advancedState.memory"
            :step="64"
            :min="0"
            :max="options!.memory"
            :color="
              (advancedState.memory < 2 * 1024 ||
                advancedState.memory > options!.memory - 1 * 1024) &&
              advancedState.memory !== 0
                ? 'amber'
                : 'primary'
            "
          />
          <p class="text-center">
            {{
              advancedState.memory === 0
                ? "Unlimited"
                : new Intl.NumberFormat(undefined, {
                    style: "unit",
                    unit: "megabyte"
                  }).format(Math.round(advancedState.memory))
            }}
          </p>
        </UFormGroup>
        <div class="space-y-2">
          <UButton type="button" block @click="stage--">Back</UButton>
          <UButton type="submit" :loading="loading" block>
            Create Server
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isAbsolute } from "pathe"
import { z } from "zod"

const toast = useToast()

const { data: options } = await useFetch("/api/options")
if (!options) throw new Error("Failed to fetch options")
const stage = ref(1)
const configureGamerulesModal = ref(false)
const loading = ref(false)

const platforms = [
  "Vanilla",
  "Fabric",
  "Forge",
  "Quilt",
  "Spigot",
  "Bukkit",
  "Paper"
]
const showSnapshots = ref(false)
const versions = await (async () => {
  const { data } = await useFetch<VersionManifest>(
    "https://launchermeta.mojang.com/mc/game/version_manifest.json"
  )
  return data.value?.versions ?? []
})()
const difficulties = ["Peaceful", "Easy", "Normal", "Hard"]
const gamemodes = ["Survival", "Creative", "Adventure", "Spectator"]
const level_types = [
  {
    value: "minecraft:normal",
    label: "Normal"
  },
  {
    value: "minecraft:flat",
    label: "Flat"
  },
  {
    value: "minecraft:large_biomes",
    label: "Large Biomes"
  },
  {
    value: "minecraft:amplified",
    label: "Amplified"
  },
  {
    value: "minecraft:single_biome_surface",
    label: "Single Biome Surface"
  }
]

const generalSchema = z.object({
  server_name: z.string().min(2),
  platform: z.enum([
    "Vanilla",
    "Fabric",
    "Forge",
    "Quilt",
    "Spigot",
    "Bukkit",
    "Paper"
  ]),
  version: z.string() // Because we dynamically fetch versions, we can't validate them
})
const worldSchema = z.object({
  difficulty: z.enum(["Peaceful", "Easy", "Normal", "Hard"]),
  gamemode: z.enum(["Survival", "Creative", "Adventure", "Spectator"]),
  hardcore: z.boolean(),
  gamerules: z.object({
    pvp: z.boolean(),
    spawn_animals: z.boolean(),
    spawn_monsters: z.boolean(),
    spawn_npcs: z.boolean(),
    spawn_protection: z.number().min(0),
    enable_command_blocks: z.boolean()
  }),
  view_distance: z.number().min(3).max(32),
  simulation_distance: z.number().min(3).max(32),
  level_type: z.object({
    value: z.string().or(z.undefined()),
    label: z.string()
  }),
  seed: z.string().optional()
})
const advancedSchema = z.object({
  port: z.number().min(1024).max(65535),
  binding: z
    .string()
    .optional()
    .refine((value) => (value ? !value.includes(":") : true), {
      message: "Path cannot contain ':'"
    })
    .refine((value) => (value ? isAbsolute(value) : true), {
      message: "Path must be absolute"
    }),
  memory: z.number().min(0)
})

const generalState = reactive({
  server_name: undefined,
  platform: undefined,
  version: undefined
})
const worldState = reactive({
  difficulty: "Easy",
  gamemode: "Survival",
  hardcore: false,
  gamerules: {
    pvp: true,
    spawn_animals: true,
    spawn_monsters: true,
    spawn_npcs: true,
    spawn_protection: 16,
    enable_command_blocks: false
  },
  view_distance: 10,
  simulation_distance: 10,
  level_type: level_types[0],
  seed: undefined
})
const advancedState = reactive({
  port: 25565,
  binding: undefined,
  memory: 0
})

async function createServer() {
  loading.value = true
  const response = await $fetch("/api/create-server", {
    method: "POST",
    body: {
      general: generalState,
      world: {
        ...worldState,
        level_type: worldState.level_type.value ?? worldState.level_type.label
      },
      advanced: advancedState
    },
    async onResponseError({ response }) {
      console.log("Error", response)
    }
  })
  loading.value = false
  toast.add({ title: "Server created" })
  console.log(response)
}
</script>
