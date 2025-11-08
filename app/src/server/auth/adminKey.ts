import { HttpError } from 'wasp/server'

type HeaderRecord = Record<string, string | undefined>

type HeaderBag = Headers | HeaderRecord

const ADMIN_HEADER = 'x-system-admin-api-key'

const isHeadersInstance = (value: HeaderBag): value is Headers =>
  typeof Headers !== 'undefined' && value instanceof Headers

const normalizeRecordLookup = (record: HeaderRecord, name: string): string | undefined => {
  const lower = name.toLowerCase()
  const upper = name.toUpperCase()
  return record[name] ?? record[lower] ?? record[upper]
}

const readHeader = (headers: HeaderBag | undefined, name: string): string | undefined => {
  if (!headers) {
    return undefined
  }

  if (isHeadersInstance(headers)) {
    return headers.get(name) || headers.get(name.toLowerCase()) || headers.get(name.toUpperCase()) || undefined
  }

  return normalizeRecordLookup(headers, name)
}

export type AdminContext = {
  httpRequest?: {
    headers?: HeaderBag
  }
}

export const requireAdminKey = (context: AdminContext): void => {
  const expected = process.env.SYSTEM_ADMIN_API_KEY
  if (!expected) {
    throw new HttpError(500, 'SYSTEM_ADMIN_API_KEY is not configured on the server.')
  }

  const provided = readHeader(context.httpRequest?.headers, ADMIN_HEADER)

  if (!provided || provided !== expected) {
    throw new HttpError(401, 'Admin key missing or invalid.')
  }
}
