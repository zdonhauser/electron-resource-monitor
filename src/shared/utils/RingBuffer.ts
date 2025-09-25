/**
 * Efficient ring buffer implementation with O(1) operations
 * Uses head/tail pointers to avoid array shifting operations
 */
export class RingBuffer<T> {
    private buffer: (T | undefined)[]
    private head: number = 0
    private tail: number = 0
    private size: number = 0
    private readonly capacity: number

    constructor(capacity: number) {
        if (capacity <= 0) {
            throw new Error('Ring buffer capacity must be greater than 0')
        }
        this.capacity = capacity
        this.buffer = new Array(capacity)
    }

    /**
     * Add an item to the ring buffer (O(1) operation)
     * Overwrites oldest item when buffer is full
     */
    push(item: T): void {
        this.buffer[this.tail] = item
        this.tail = (this.tail + 1) % this.capacity

        if (this.size < this.capacity) {
            this.size++
        } else {
            // Buffer is full, move head pointer to maintain size
            this.head = (this.head + 1) % this.capacity
        }
    }

    /**
     * Get the most recently added item (O(1) operation)
     */
    getLatest(): T | undefined {
        if (this.isEmpty) {
            return undefined
        }
        const latestIndex = this.tail === 0 ? this.capacity - 1 : this.tail - 1
        return this.buffer[latestIndex]
    }

    /**
     * Get all items in chronological order (oldest to newest)
     * Returns a new array without modifying the ring buffer
     */
    getAll(): T[] {
        if (this.isEmpty) {
            return []
        }

        const result: T[] = []
        let current = this.head

        for (let i = 0; i < this.size; i++) {
            const item = this.buffer[current]
            if (item !== undefined) {
                result.push(item)
            }
            current = (current + 1) % this.capacity
        }

        return result
    }

    /**
     * Get the last N items in chronological order
     * More efficient than getAll() when only recent items are needed
     */
    getRecent(count: number): T[] {
        if (count <= 0 || this.isEmpty) {
            return []
        }

        const actualCount = Math.min(count, this.size)
        const result: T[] = []

        // Start from the position that gives us the last N items
        const startOffset = this.size - actualCount
        let current = (this.head + startOffset) % this.capacity

        for (let i = 0; i < actualCount; i++) {
            const item = this.buffer[current]
            if (item !== undefined) {
                result.push(item)
            }
            current = (current + 1) % this.capacity
        }

        return result
    }

    /**
     * Clear all items from the buffer (O(1) operation)
     * Resets pointers without deallocating the underlying array
     */
    clear(): void {
        this.head = 0
        this.tail = 0
        this.size = 0
        // Don't clear the array - just reset pointers for efficiency
    }

    /**
     * Resize the buffer while preserving existing data up to new capacity
     */
    resize(newCapacity: number): void {
        if (newCapacity <= 0) {
            throw new Error('Ring buffer capacity must be greater than 0')
        }

        if (newCapacity === this.capacity) {
            return
        }

        // Get current data in order
        const currentData = this.getAll()

        // Create new buffer
        this.buffer = new Array(newCapacity)
            // Use type assertion to modify readonly property during resize
            ; (this as any).capacity = newCapacity
        this.head = 0
        this.tail = 0
        this.size = 0

        // Re-add data up to new capacity
        const dataToKeep = currentData.slice(-newCapacity)
        for (const item of dataToKeep) {
            this.push(item)
        }
    }

    /**
     * Get the current number of items in the buffer
     */
    get length(): number {
        return this.size
    }

    /**
     * Check if the buffer is at full capacity
     */
    get isFull(): boolean {
        return this.size === this.capacity
    }

    /**
     * Check if the buffer is empty
     */
    get isEmpty(): boolean {
        return this.size === 0
    }

    /**
     * Get the maximum capacity of the buffer
     */
    get maxCapacity(): number {
        return this.capacity
    }

    /**
     * Get buffer utilization as a percentage (0-100)
     */
    get utilization(): number {
        return (this.size / this.capacity) * 100
    }
}