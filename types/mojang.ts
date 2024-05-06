export type VersionInfo = {
  id: string
  type: "release" | "snapshot"
  url: string
  time: string
  releaseTime: string
}

export type VersionManifest = {
  latest: {
    release: string
    snapshot: string
  }
  versions: VersionInfo[]
}
