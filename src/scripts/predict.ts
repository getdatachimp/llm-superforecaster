import * as dotenv from 'dotenv'
dotenv.config()

import { Command } from 'commander'
import * as fs from 'fs/promises'
import * as path from 'path'

import {forecast} from '../lib/forecast'

const program = new Command()

program
  .version('0.1.0')
  .argument('<filePath>', 'path to json question file')
  .action(async (filePath) => {
    try {
      // Resolve the file path relative to the current directory
      const absolutePath = path.resolve(process.cwd(), filePath)

      // Read the JSON file
      const data = await fs.readFile(absolutePath, { encoding: 'utf-8' })
      const query = JSON.parse(data)

      const prediction = await forecast(query)
      const output = JSON.stringify(prediction, null, 2)

      const timestamp = Math.floor(Date.now() / 1000)
      await fs.mkdir("output", { recursive: true });
      const filename = `output/prediction-${timestamp}.txt`
      await fs.writeFile(filename, output)
      console.log(`Output written successfully to ${filename}.`)

    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  })

program.parse(process.argv)
