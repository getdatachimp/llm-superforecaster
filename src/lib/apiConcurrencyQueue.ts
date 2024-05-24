export default class APIConcurrencyQueue {
  private maxConnections: number
  private buffer: number
  private openConnections = 0
  private queue: (() => void)[] = []

  constructor({
    maxConnections,
    buffer
  }: {
    maxConnections: number
    buffer: number
}) {
    this.maxConnections = maxConnections
    this.buffer = buffer
  }

  private dequeue() {
    if (this.queue.length > 0 && this.openConnections < this.maxConnections) {
      const nextTask = this.queue.shift()
      if (nextTask) nextTask()
    }
  }

  queueWithRetries = async <T>({
    task,
    name,
    maxRetries = 8,
    backoffDuration = 20_000,
  }: {
    task: () => Promise<T>
    name: string
    maxRetries?: number
    backoffDuration?: number
  }): Promise<T> => {
    const request = async () => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          console.log(`Begining task: ${name}`)
          return await task()
        } catch (error) {
          console.log(`Error #${attempt + 1}: ${name}.`, error.message)

          if (attempt < maxRetries - 1) {
            console.log(`Retrying: ${name}`)
            const backoff = (attempt + 1) * backoffDuration
            await new Promise((resolve) => setTimeout(resolve, backoff))
          } else {
            console.log(`Failure: ${name}. Exiting`)
            throw error
          }
        }
      }
    }

    return this.addToQueue(request)
  }

  addToQueue = async <T>(task: () => Promise<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {

      const executeTask = async () => {
        if (this.openConnections >= this.maxConnections) {
          return setTimeout(executeTask, this.buffer)
        }

        this.openConnections++

        try {
          const result = await task()
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          this.openConnections--
          setTimeout(() => this.dequeue(), this.buffer)
        }
      }

      this.queue.push(executeTask)
      this.dequeue()
    })
  }
}
