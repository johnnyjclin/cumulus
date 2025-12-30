import { Connection } from "mongoose";

declare global {
  let mongoose: {
    conn: Connection | null;
    promise: Promise<typeof import("mongoose")> | null;
  };
}

export {};
