import { integrations } from '../src/server/integrations'

async function main() {
  try {
    const result = await integrations.lighting.runSelfTest()
    console.log('Lighting self-test:', result)
    if (!result.success) process.exitCode = 1
  } catch (error) {
    console.error('Lighting self-test failed:', error)
    process.exitCode = 1
  }
}

void main()
