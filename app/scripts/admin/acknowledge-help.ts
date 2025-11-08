import 'dotenv/config'

const DEFAULT_URL = 'http://localhost:3001/actions/adminAcknowledgeHelp'

async function main() {
  const apiKey = process.env.SYSTEM_ADMIN_API_KEY
  if (!apiKey) {
    console.error('SYSTEM_ADMIN_API_KEY missing.')
    process.exit(1)
  }

  const endpoint = process.env.ADMIN_ENDPOINT ?? DEFAULT_URL

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-system-admin-api-key': apiKey,
    },
    body: JSON.stringify({}),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Admin acknowledge failed (${response.status}): ${text}`)
  }

  const data = await response.json().catch(() => ({}))
  console.log('Admin acknowledge response:', data)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
