import Database from 'better-sqlite3'
import { app } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import type {
  CpuMetrics,
  MemoryMetrics,
  DiskMetrics,
  NetworkMetrics,
  ProcessMetrics
} from '../../../shared/types/telemetry'

export class DatabaseService {
  private db: Database.Database | null = null
  private readonly dbPath: string

  constructor() {
    const userDataPath = app.getPath('userData')
    const dbDir = path.join(userDataPath, 'data')

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    this.dbPath = path.join(dbDir, 'telemetry.db')
  }

  initialize(): void {
    this.db = new Database(this.dbPath)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('synchronous = NORMAL')

    this.createTables()
    this.prepareStatements()
  }

  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  private createTables(): void {
    if (!this.db) return

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cpu_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        usage REAL NOT NULL,
        cores INTEGER NOT NULL,
        load_average_1 REAL NOT NULL,
        load_average_5 REAL NOT NULL,
        load_average_15 REAL NOT NULL,
        temperature REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_cpu_timestamp ON cpu_metrics(timestamp);
      CREATE INDEX IF NOT EXISTS idx_cpu_host ON cpu_metrics(host_id, timestamp);

      CREATE TABLE IF NOT EXISTS memory_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        total INTEGER NOT NULL,
        used INTEGER NOT NULL,
        free INTEGER NOT NULL,
        available INTEGER NOT NULL,
        swap_total INTEGER,
        swap_used INTEGER,
        swap_free INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_memory_timestamp ON memory_metrics(timestamp);
      CREATE INDEX IF NOT EXISTS idx_memory_host ON memory_metrics(host_id, timestamp);

      CREATE TABLE IF NOT EXISTS disk_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        device_name TEXT NOT NULL,
        mount_point TEXT NOT NULL,
        total INTEGER NOT NULL,
        used INTEGER NOT NULL,
        free INTEGER NOT NULL,
        percentage REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_disk_timestamp ON disk_metrics(timestamp);
      CREATE INDEX IF NOT EXISTS idx_disk_host ON disk_metrics(host_id, timestamp);

      CREATE TABLE IF NOT EXISTS network_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        interface_name TEXT NOT NULL,
        bytes_received INTEGER NOT NULL,
        bytes_sent INTEGER NOT NULL,
        packets_received INTEGER NOT NULL,
        packets_sent INTEGER NOT NULL,
        error_in INTEGER NOT NULL,
        error_out INTEGER NOT NULL,
        drop_in INTEGER NOT NULL,
        drop_out INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_network_timestamp ON network_metrics(timestamp);
      CREATE INDEX IF NOT EXISTS idx_network_host ON network_metrics(host_id, timestamp);

      CREATE TABLE IF NOT EXISTS process_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        pid INTEGER NOT NULL,
        name TEXT NOT NULL,
        cpu REAL NOT NULL,
        memory REAL NOT NULL,
        ppid INTEGER,
        uid INTEGER,
        gid INTEGER,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_process_timestamp ON process_metrics(timestamp);
      CREATE INDEX IF NOT EXISTS idx_process_host ON process_metrics(host_id, timestamp);
    `)
  }

  private prepareStatements(): void {
    if (!this.db) return

    this.insertCpuStmt = this.db.prepare(`
      INSERT INTO cpu_metrics (
        host_id, timestamp, usage, cores,
        load_average_1, load_average_5, load_average_15, temperature
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    this.insertMemoryStmt = this.db.prepare(`
      INSERT INTO memory_metrics (
        host_id, timestamp, total, used, free, available,
        swap_total, swap_used, swap_free
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    this.insertDiskStmt = this.db.prepare(`
      INSERT INTO disk_metrics (
        host_id, timestamp, device_name, mount_point,
        total, used, free, percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    this.insertNetworkStmt = this.db.prepare(`
      INSERT INTO network_metrics (
        host_id, timestamp, interface_name,
        bytes_received, bytes_sent, packets_received, packets_sent,
        error_in, error_out, drop_in, drop_out
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    this.insertProcessStmt = this.db.prepare(`
      INSERT INTO process_metrics (
        host_id, timestamp, pid, name, cpu, memory,
        ppid, uid, gid, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
  }

  private insertCpuStmt?: Database.Statement
  private insertMemoryStmt?: Database.Statement
  private insertDiskStmt?: Database.Statement
  private insertNetworkStmt?: Database.Statement
  private insertProcessStmt?: Database.Statement

  saveCpuMetrics(metrics: CpuMetrics): void {
    if (!this.db || !this.insertCpuStmt) return

    this.insertCpuStmt.run(
      metrics.hostId,
      metrics.timestamp,
      metrics.usage,
      metrics.cores,
      metrics.loadAverage[0],
      metrics.loadAverage[1],
      metrics.loadAverage[2],
      metrics.temperature || null
    )
  }

  saveMemoryMetrics(metrics: MemoryMetrics): void {
    if (!this.db || !this.insertMemoryStmt) return

    this.insertMemoryStmt.run(
      metrics.hostId,
      metrics.timestamp,
      metrics.total,
      metrics.used,
      metrics.free,
      metrics.available,
      metrics.swapTotal || null,
      metrics.swapUsed || null,
      metrics.swapFree || null
    )
  }

  saveDiskMetrics(metrics: DiskMetrics): void {
    if (!this.db || !this.insertDiskStmt) return

    const transaction = this.db.transaction(() => {
      for (const device of metrics.devices) {
        this.insertDiskStmt!.run(
          metrics.hostId,
          metrics.timestamp,
          device.name,
          device.mount,
          device.total,
          device.used,
          device.free,
          device.percentage
        )
      }
    })

    transaction()
  }

  saveNetworkMetrics(metrics: NetworkMetrics): void {
    if (!this.db || !this.insertNetworkStmt) return

    const transaction = this.db.transaction(() => {
      for (const iface of metrics.interfaces) {
        this.insertNetworkStmt!.run(
          metrics.hostId,
          metrics.timestamp,
          iface.name,
          iface.bytesReceived,
          iface.bytesSent,
          iface.packetsReceived,
          iface.packetsSent,
          iface.errorIn,
          iface.errorOut,
          iface.dropIn,
          iface.dropOut
        )
      }
    })

    transaction()
  }

  saveProcessMetrics(metrics: ProcessMetrics): void {
    if (!this.db || !this.insertProcessStmt) return

    const transaction = this.db.transaction(() => {
      for (const proc of metrics.processes) {
        this.insertProcessStmt!.run(
          metrics.hostId,
          metrics.timestamp,
          proc.pid,
          proc.name,
          proc.cpu,
          proc.memory,
          proc.ppid || null,
          proc.uid || null,
          proc.gid || null,
          proc.status || null
        )
      }
    })

    transaction()
  }

  query(sql: string, params?: any[]): any[] {
    if (!this.db) return []

    try {
      const stmt = this.db.prepare(sql)
      return params ? stmt.all(params) : stmt.all()
    } catch (error) {
      console.error('Database query error:', error)
      return []
    }
  }

  exportData(format: 'json' | 'csv', startTime?: number, endTime?: number): string {
    if (!this.db) return ''

    const whereClause = this.buildWhereClause(startTime, endTime)

    const cpuData = this.db.prepare(`SELECT * FROM cpu_metrics ${whereClause}`).all()
    const memoryData = this.db.prepare(`SELECT * FROM memory_metrics ${whereClause}`).all()
    const diskData = this.db.prepare(`SELECT * FROM disk_metrics ${whereClause}`).all()
    const networkData = this.db.prepare(`SELECT * FROM network_metrics ${whereClause}`).all()
    const processData = this.db.prepare(`SELECT * FROM process_metrics ${whereClause}`).all()

    if (format === 'json') {
      return JSON.stringify(
        {
          cpu: cpuData,
          memory: memoryData,
          disk: diskData,
          network: networkData,
          processes: processData
        },
        null,
        2
      )
    } else {
      let csv = 'Type,Data\n'
      csv += cpuData.map((d: any) => `cpu,${JSON.stringify(d)}`).join('\n')
      csv += memoryData.map((d: any) => `memory,${JSON.stringify(d)}`).join('\n')
      csv += diskData.map((d: any) => `disk,${JSON.stringify(d)}`).join('\n')
      csv += networkData.map((d: any) => `network,${JSON.stringify(d)}`).join('\n')
      csv += processData.map((d: any) => `process,${JSON.stringify(d)}`).join('\n')
      return csv
    }
  }

  private buildWhereClause(startTime?: number, endTime?: number): string {
    const conditions: string[] = []

    if (startTime) {
      conditions.push(`timestamp >= ${startTime}`)
    }

    if (endTime) {
      conditions.push(`timestamp <= ${endTime}`)
    }

    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  }

  cleanOldData(daysToKeep: number = 7): void {
    if (!this.db) return

    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000

    this.db.exec(`
      DELETE FROM cpu_metrics WHERE timestamp < ${cutoffTime};
      DELETE FROM memory_metrics WHERE timestamp < ${cutoffTime};
      DELETE FROM disk_metrics WHERE timestamp < ${cutoffTime};
      DELETE FROM network_metrics WHERE timestamp < ${cutoffTime};
      DELETE FROM process_metrics WHERE timestamp < ${cutoffTime};
      VACUUM;
    `)
  }
}
