'use server';

import os from 'os';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';
import { ApiError, BaseError } from '@/types/errors';
import { Response } from '@/types/actions';
import { Hosts } from '@/types/hosts';

// Helper to get the server's local IP address
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const alias of iface || []) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '127.0.0.1'; // Fallback to localhost
}

// Define placeholder constants for remote hosts
const REMOTE_API_HOST = ''; // Placeholder for database retrieval
const REMOTE_DB_HOST = ''; // Placeholder for database retrieval

export async function resolveHosts() {
  try {
    const localIP = getLocalIPAddress();
    logger.debug(localIP);
    const requestHeaders = await headers();

    // Get the "host" header to check the request origin
    const hostHeader = requestHeaders.get('host') || '';
    const isLocal = hostHeader.startsWith(localIP) || hostHeader.includes('localhost');

    // Resolve API and DB hosts
    const apiHost = isLocal
      ? `${localIP}:9999` // Replace PORT with your app's port
      : REMOTE_API_HOST || 'localhost:9999';

    const dbHost = isLocal
      ? `${localIP}:8090` // Replace PORT with your database port
      : REMOTE_DB_HOST || 'localhost:8090';

    const hosts = { apiHost, dbHost };
    logger.debug(hosts);
    return new Response<Hosts, undefined, BaseError>("hosts", hosts, undefined).toJSON();
  } catch (e) {
    logger.error(e);
    const error = new ApiError<BaseError>(e as Error).toJSON();
    return new Response<Hosts, undefined, BaseError>("hosts", undefined, undefined, error).toJSON();
  }
}
