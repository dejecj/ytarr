'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { LogFilesProps } from '@/types/logs'

export function LogFiles({ logs }: LogFilesProps) {

  return (
    <div className="space-y-4">
      <Alert className="bg-primary/80 border-primary">
        <AlertDescription className="text-white">
          <p>Log files are located in: /config/logs</p>
          <p>
            The log level defaults to &apos;Info&apos; and can be changed in{' '}
            <a href="/settings" className="text-white-500 hover:text-white-400 font-bold hover:underline">
              General Settings
            </a>
          </p>
        </AlertDescription>
      </Alert>

      <div className="rounded-md border border-primary/40">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40">
              <TableHead className="">Filename</TableHead>
              <TableHead className="text-right">Last Write Time</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.filename} className="border-border/40">
                <TableCell className="">{log.filename}</TableCell>
                <TableCell className="text-right">{log.lastWriteTime}</TableCell>
                <TableCell className="text-right">
                  <a
                    href={log.downloadUrl}
                    className="text-red-500 hover:text-red-400 hover:underline"
                    download
                  >
                    Download
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

