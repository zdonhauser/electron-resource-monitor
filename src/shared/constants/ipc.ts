export const IPC_CHANNELS = {
  TELEMETRY: {
    CPU: 'hosts/{hostId}/telemetry/cpu',
    MEMORY: 'hosts/{hostId}/telemetry/memory',
    DISK: 'hosts/{hostId}/telemetry/disk',
    NETWORK: 'hosts/{hostId}/telemetry/network',
    PROCESSES: 'hosts/{hostId}/telemetry/processes',
    ALL: 'hosts/{hostId}/telemetry/all'
  },
  CONTROL: {
    START_SAMPLING: 'control/commands/start-sampling',
    STOP_SAMPLING: 'control/commands/stop-sampling',
    UPDATE_SETTINGS: 'control/commands/update-settings',
    GET_SETTINGS: 'control/commands/get-settings',
    ACK: 'control/acks/{command}'
  },
  DATABASE: {
    QUERY: 'database/query',
    EXPORT: 'database/export'
  },
  SYSTEM: {
    ERROR: 'system/error',
    LOG: 'system/log',
    READY: 'system/ready'
  }
} as const

export function formatChannel(template: string, params: Record<string, string>): string {
  return Object.entries(params).reduce(
    (str, [key, value]) => str.replace(`{${key}}`, value),
    template
  )
}

export const DEFAULT_HOST_ID = 'local'
