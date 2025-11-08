import { integrations } from '../src/server/integrations'

async function main() {
  try {
    const result = await integrations.guide.runSelfTest()
    console.log('Guide self-test:', result)
    if (!result.success) {
      process.exitCode = 1
    }
  } catch (error) {
    console.error('Guide self-test failed:', error)
    process.exitCode = 1
  }
}

void main()
