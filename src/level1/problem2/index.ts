import { randomBytes } from "crypto";

export class ObjectId {
  private data: Buffer;

  private static rdm: Buffer = randomBytes(4);
  private static ctr: number = Math.floor(Math.random() * 0xFFFFFF); // Initializing ctr to a random value
  private static prevTimestamp: BigInt = BigInt(0);

  constructor(type: number, timestamp: number) {
    const buffer = Buffer.alloc(14); // 1 + 6 + 4 + 3 bytes

    // Type (1 byte)
    buffer.writeUInt8(type, 0);

    // Timestamp (6 bytes)
    const tsBuffer = Buffer.alloc(8); // Allocate 8 bytes for BigInt
    const currentTimestamp = BigInt(timestamp);

    if (currentTimestamp === ObjectId.prevTimestamp) {
      // If the timestamp is the same as the last one, increment the counter
      ObjectId.ctr = (ObjectId.ctr + 1) % 0xFFFFFF;
    } else {
      // Reset counter if timestamp has changed
      ObjectId.ctr = Math.floor(Math.random() * 0xFFFFFF);
      ObjectId.prevTimestamp = currentTimestamp;
    }

    tsBuffer.writeBigUInt64BE(currentTimestamp, 0);
    tsBuffer.copy(buffer, 1, 2, 8); // Copy only the last 6 bytes

    // Random (4 bytes)
    ObjectId.rdm.copy(buffer, 7);

    // Counter (3 bytes)
    buffer.writeUIntBE(ObjectId.ctr, 11, 3);

    this.data = buffer;
  }

  static generate(type?: number): ObjectId {
    return new ObjectId(type ?? 0, Date.now());
  }
  
  toString(encoding?: 'hex' | 'base64'): string {
    return this.data.toString(encoding ?? 'hex');
  }
}