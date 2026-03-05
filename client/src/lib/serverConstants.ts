import type { ServerStatus } from "./types"

//Ark
export const ArkServerListStyle = "grid grid-cols-[25px_150px_150px_80px_50px_1fr] gap-4 px-2"
export const ArkServerFields = ["", "Name", "Session", "Players", "Ping", "Password"]

//Valheim
export const ValheimServerListStyle = "grid grid-cols-[25px_150px_150px_80px_1fr] gap-4 px-2"
export const ValheimServerFields = ["", "Name", "Session", "Players", "Password"]

//minecraft
export const MinecraftServerListStyle = "grid grid-cols-[25px_300px_175px_1fr] gap-4 px-2"
export const MinecraftServerFields = ["", "Name", "IP", "Players"]

//Enshrouded
export const EnshroudedServerListStyle = "grid grid-cols-[25px_150px_150px_150px_1fr] gap-4 px-2"
export const EnshroudedServerFields = ["", "Name", "Session", "Password", "Players"]


export const statusStyles: Record<
  ServerStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  online: {
    label: "Online",
    dotClass: "bg-chart-2",
    badgeClass: "bg-chart-2/15 text-status-online bg-chart-2/30",
  },
  full: {
    label: "Full",
    dotClass: "bg-chart-3",
    badgeClass: "bg-chart-3/15 text-status-full bg-chart-3/30",
  },
  offline: {
    label: "Offline",
    dotClass: "bg-ring",
    badgeClass:
      "bg-chart-5/15 text-status-offline bg-chart-5/30",
  },
}