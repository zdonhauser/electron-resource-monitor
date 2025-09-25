import { RingBuffer } from '../../src/shared/utils/RingBuffer'

describe('RingBuffer', () => {
    describe('constructor', () => {
        it('should create a ring buffer with specified capacity', () => {
            const buffer = new RingBuffer<number>(5)
            expect(buffer.maxCapacity).toBe(5)
            expect(buffer.length).toBe(0)
            expect(buffer.isEmpty).toBe(true)
            expect(buffer.isFull).toBe(false)
        })

        it('should throw error for invalid capacity', () => {
            expect(() => new RingBuffer<number>(0)).toThrow('Ring buffer capacity must be greater than 0')
            expect(() => new RingBuffer<number>(-1)).toThrow('Ring buffer capacity must be greater than 0')
        })
    })

    describe('push operation', () => {
        it('should add items to empty buffer', () => {
            const buffer = new RingBuffer<number>(3)

            buffer.push(1)
            expect(buffer.length).toBe(1)
            expect(buffer.getLatest()).toBe(1)
            expect(buffer.getAll()).toEqual([1])
        })

        it('should add multiple items in order', () => {
            const buffer = new RingBuffer<number>(3)

            buffer.push(1)
            buffer.push(2)
            buffer.push(3)

            expect(buffer.length).toBe(3)
            expect(buffer.isFull).toBe(true)
            expect(buffer.getAll()).toEqual([1, 2, 3])
            expect(buffer.getLatest()).toBe(3)
        })

        it('should overwrite oldest items when buffer is full', () => {
            const buffer = new RingBuffer<number>(3)

            // Fill buffer
            buffer.push(1)
            buffer.push(2)
            buffer.push(3)

            // Add more items - should overwrite oldest
            buffer.push(4)
            expect(buffer.getAll()).toEqual([2, 3, 4])
            expect(buffer.length).toBe(3)
            expect(buffer.isFull).toBe(true)

            buffer.push(5)
            expect(buffer.getAll()).toEqual([3, 4, 5])

            buffer.push(6)
            expect(buffer.getAll()).toEqual([4, 5, 6])
        })

        it('should handle single item buffer', () => {
            const buffer = new RingBuffer<string>(1)

            buffer.push('first')
            expect(buffer.getAll()).toEqual(['first'])

            buffer.push('second')
            expect(buffer.getAll()).toEqual(['second'])
            expect(buffer.length).toBe(1)
        })
    })

    describe('getLatest operation', () => {
        it('should return undefined for empty buffer', () => {
            const buffer = new RingBuffer<number>(3)
            expect(buffer.getLatest()).toBeUndefined()
        })

        it('should return most recent item', () => {
            const buffer = new RingBuffer<number>(3)

            buffer.push(1)
            expect(buffer.getLatest()).toBe(1)

            buffer.push(2)
            expect(buffer.getLatest()).toBe(2)

            buffer.push(3)
            expect(buffer.getLatest()).toBe(3)
        })

        it('should return correct item after wraparound', () => {
            const buffer = new RingBuffer<number>(2)

            buffer.push(1)
            buffer.push(2)
            buffer.push(3) // Overwrites 1

            expect(buffer.getLatest()).toBe(3)
        })
    })

    describe('getAll operation', () => {
        it('should return empty array for empty buffer', () => {
            const buffer = new RingBuffer<number>(3)
            expect(buffer.getAll()).toEqual([])
        })

        it('should return items in chronological order', () => {
            const buffer = new RingBuffer<number>(5)

            buffer.push(1)
            buffer.push(2)
            buffer.push(3)

            expect(buffer.getAll()).toEqual([1, 2, 3])
        })

        it('should return correct order after wraparound', () => {
            const buffer = new RingBuffer<number>(3)

            // Fill buffer
            buffer.push(1)
            buffer.push(2)
            buffer.push(3)

            // Cause wraparound
            buffer.push(4)
            buffer.push(5)

            expect(buffer.getAll()).toEqual([3, 4, 5])
        })

        it('should not modify the original buffer', () => {
            const buffer = new RingBuffer<number>(3)
            buffer.push(1)
            buffer.push(2)

            const result1 = buffer.getAll()
            const result2 = buffer.getAll()

            expect(result1).toEqual([1, 2])
            expect(result2).toEqual([1, 2])
            expect(result1).not.toBe(result2) // Different array instances
        })
    })

    describe('getRecent operation', () => {
        it('should return empty array for empty buffer', () => {
            const buffer = new RingBuffer<number>(3)
            expect(buffer.getRecent(2)).toEqual([])
        })

        it('should return empty array for count <= 0', () => {
            const buffer = new RingBuffer<number>(3)
            buffer.push(1)
            buffer.push(2)

            expect(buffer.getRecent(0)).toEqual([])
            expect(buffer.getRecent(-1)).toEqual([])
        })

        it('should return last N items in chronological order', () => {
            const buffer = new RingBuffer<number>(5)

            buffer.push(1)
            buffer.push(2)
            buffer.push(3)
            buffer.push(4)
            buffer.push(5)

            expect(buffer.getRecent(3)).toEqual([3, 4, 5])
            expect(buffer.getRecent(2)).toEqual([4, 5])
            expect(buffer.getRecent(1)).toEqual([5])
        })

        it('should handle count larger than buffer size', () => {
            const buffer = new RingBuffer<number>(3)

            buffer.push(1)
            buffer.push(2)

            expect(buffer.getRecent(5)).toEqual([1, 2])
        })

        it('should work correctly after wraparound', () => {
            const buffer = new RingBuffer<number>(3)

            buffer.push(1)
            buffer.push(2)
            buffer.push(3)
            buffer.push(4) // Overwrites 1
            buffer.push(5) // Overwrites 2

            expect(buffer.getRecent(2)).toEqual([4, 5])
            expect(buffer.getRecent(3)).toEqual([3, 4, 5])
        })
    })

    describe('clear operation', () => {
        it('should clear empty buffer', () => {
            const buffer = new RingBuffer<number>(3)
            buffer.clear()

            expect(buffer.length).toBe(0)
            expect(buffer.isEmpty).toBe(true)
            expect(buffer.getAll()).toEqual([])
        })

        it('should clear buffer with items', () => {
            const buffer = new RingBuffer<number>(3)

            buffer.push(1)
            buffer.push(2)
            buffer.push(3)

            buffer.clear()

            expect(buffer.length).toBe(0)
            expect(buffer.isEmpty).toBe(true)
            expect(buffer.isFull).toBe(false)
            expect(buffer.getAll()).toEqual([])
            expect(buffer.getLatest()).toBeUndefined()
        })

        it('should allow adding items after clear', () => {
            const buffer = new RingBuffer<number>(3)

            buffer.push(1)
            buffer.push(2)
            buffer.clear()

            buffer.push(10)
            buffer.push(20)

            expect(buffer.getAll()).toEqual([10, 20])
            expect(buffer.length).toBe(2)
        })
    })

    describe('resize operation', () => {
        it('should throw error for invalid capacity', () => {
            const buffer = new RingBuffer<number>(3)

            expect(() => buffer.resize(0)).toThrow('Ring buffer capacity must be greater than 0')
            expect(() => buffer.resize(-1)).toThrow('Ring buffer capacity must be greater than 0')
        })

        it('should do nothing if capacity is the same', () => {
            const buffer = new RingBuffer<number>(3)
            buffer.push(1)
            buffer.push(2)

            buffer.resize(3)

            expect(buffer.maxCapacity).toBe(3)
            expect(buffer.getAll()).toEqual([1, 2])
        })

        it('should expand capacity and preserve all data', () => {
            const buffer = new RingBuffer<number>(3)
            buffer.push(1)
            buffer.push(2)
            buffer.push(3)

            buffer.resize(5)

            expect(buffer.maxCapacity).toBe(5)
            expect(buffer.getAll()).toEqual([1, 2, 3])
            expect(buffer.length).toBe(3)
            expect(buffer.isFull).toBe(false)

            // Should be able to add more items
            buffer.push(4)
            buffer.push(5)
            expect(buffer.getAll()).toEqual([1, 2, 3, 4, 5])
            expect(buffer.isFull).toBe(true)
        })

        it('should shrink capacity and preserve recent data', () => {
            const buffer = new RingBuffer<number>(5)
            buffer.push(1)
            buffer.push(2)
            buffer.push(3)
            buffer.push(4)
            buffer.push(5)

            buffer.resize(3)

            expect(buffer.maxCapacity).toBe(3)
            expect(buffer.getAll()).toEqual([3, 4, 5]) // Keep most recent
            expect(buffer.length).toBe(3)
            expect(buffer.isFull).toBe(true)
        })

        it('should handle resize after wraparound', () => {
            const buffer = new RingBuffer<number>(3)
            buffer.push(1)
            buffer.push(2)
            buffer.push(3)
            buffer.push(4) // Overwrites 1
            buffer.push(5) // Overwrites 2

            buffer.resize(2)

            expect(buffer.maxCapacity).toBe(2)
            expect(buffer.getAll()).toEqual([4, 5])
            expect(buffer.isFull).toBe(true)
        })

        it('should handle resize to larger capacity after wraparound', () => {
            const buffer = new RingBuffer<number>(3)
            buffer.push(1)
            buffer.push(2)
            buffer.push(3)
            buffer.push(4) // Overwrites 1

            buffer.resize(5)

            expect(buffer.maxCapacity).toBe(5)
            expect(buffer.getAll()).toEqual([2, 3, 4])
            expect(buffer.length).toBe(3)
            expect(buffer.isFull).toBe(false)
        })
    })

    describe('properties', () => {
        it('should report correct length', () => {
            const buffer = new RingBuffer<number>(3)

            expect(buffer.length).toBe(0)

            buffer.push(1)
            expect(buffer.length).toBe(1)

            buffer.push(2)
            expect(buffer.length).toBe(2)

            buffer.push(3)
            expect(buffer.length).toBe(3)

            buffer.push(4) // Overwrites oldest
            expect(buffer.length).toBe(3)
        })

        it('should report correct isEmpty status', () => {
            const buffer = new RingBuffer<number>(3)

            expect(buffer.isEmpty).toBe(true)

            buffer.push(1)
            expect(buffer.isEmpty).toBe(false)

            buffer.clear()
            expect(buffer.isEmpty).toBe(true)
        })

        it('should report correct isFull status', () => {
            const buffer = new RingBuffer<number>(2)

            expect(buffer.isFull).toBe(false)

            buffer.push(1)
            expect(buffer.isFull).toBe(false)

            buffer.push(2)
            expect(buffer.isFull).toBe(true)

            buffer.push(3) // Overwrites oldest
            expect(buffer.isFull).toBe(true)
        })

        it('should report correct utilization', () => {
            const buffer = new RingBuffer<number>(4)

            expect(buffer.utilization).toBe(0)

            buffer.push(1)
            expect(buffer.utilization).toBe(25)

            buffer.push(2)
            expect(buffer.utilization).toBe(50)

            buffer.push(3)
            expect(buffer.utilization).toBe(75)

            buffer.push(4)
            expect(buffer.utilization).toBe(100)

            buffer.push(5) // Overwrites oldest
            expect(buffer.utilization).toBe(100)
        })
    })

    describe('performance characteristics', () => {
        it('should handle large number of operations efficiently', () => {
            const buffer = new RingBuffer<number>(1000)
            const startTime = performance.now()

            // Add 10,000 items (causing multiple wraparounds)
            for (let i = 0; i < 10000; i++) {
                buffer.push(i)
            }

            const endTime = performance.now()
            const duration = endTime - startTime

            // Should complete quickly (less than 100ms on modern hardware)
            expect(duration).toBeLessThan(100)
            expect(buffer.length).toBe(1000)
            expect(buffer.getLatest()).toBe(9999)

            // Verify data integrity
            const allData = buffer.getAll()
            expect(allData).toHaveLength(1000)
            expect(allData[0]).toBe(9000) // First item should be 9000
            expect(allData[999]).toBe(9999) // Last item should be 9999
        })
    })

    describe('type safety', () => {
        it('should work with different data types', () => {
            // String buffer
            const stringBuffer = new RingBuffer<string>(2)
            stringBuffer.push('hello')
            stringBuffer.push('world')
            expect(stringBuffer.getAll()).toEqual(['hello', 'world'])

            // Object buffer
            interface TestObject {
                id: number
                name: string
            }

            const objectBuffer = new RingBuffer<TestObject>(2)
            objectBuffer.push({ id: 1, name: 'first' })
            objectBuffer.push({ id: 2, name: 'second' })

            expect(objectBuffer.getAll()).toEqual([
                { id: 1, name: 'first' },
                { id: 2, name: 'second' }
            ])
        })
    })
})