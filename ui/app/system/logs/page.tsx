import { LogFiles } from './_components/log-files'
import type { LogFile } from '@/types/logs'

async function getLogs(): Promise<LogFile[]> {
  // TODO: Replace with actual API call
  return [
    {
      filename: 'ytarr.txt',
      lastWriteTime: '10:24pm',
      downloadUrl: '/api/logs/ytarr.txt'
    },
    {
      filename: 'ytarr.0.txt',
      lastWriteTime: 'Yesterday',
      downloadUrl: '/api/logs/ytarr.0.txt'
    },
    // Add more mock data as needed
  ]
}

export default async function LogsPage() {
  const logs = await getLogs()

  return (
    <div className="container py-6 px-4">
      <LogFiles logs={logs} />
    </div>
  )
}

