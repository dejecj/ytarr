export interface LogFile {
  filename: string
  lastWriteTime: string
  downloadUrl: string
}

export interface LogFilesProps {
  logs: LogFile[]
}

