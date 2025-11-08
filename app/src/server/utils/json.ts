import { z } from 'zod'

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | JsonObject
export type JsonObject = { [key: string]: JsonValue }

const jsonPrimitiveSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    jsonPrimitiveSchema,
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ])
)
const jsonObjectSchema = z.record(z.string(), jsonValueSchema)

export const parseJsonField = (raw: unknown): JsonValue | null => {
  if (raw === null || raw === undefined) return null

  let parsed: unknown = raw
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw)
    } catch {
      return null
    }
  }

  const result = jsonValueSchema.safeParse(parsed)
  return result.success ? result.data : null
}

export const stringifyJsonField = (value: JsonValue | null | undefined): string => {
  try {
    return JSON.stringify(value ?? null)
  } catch {
    return 'null'
  }
}

export const coerceJsonObject = (value: unknown): JsonObject => {
  const candidate =
    typeof value === 'string'
      ? (() => {
          try {
            return JSON.parse(value)
          } catch {
            return {}
          }
        })()
      : value
  const result = jsonObjectSchema.safeParse(candidate ?? {})
  return result.success ? result.data : {}
}
