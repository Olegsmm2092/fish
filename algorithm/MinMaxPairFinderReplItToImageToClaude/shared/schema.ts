import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Schemas for array pair calculation
export interface ArrayData {
  type: string;
  array: number[];
}

export interface PairResult {
  min: number[];
  max: number[];
  originalArray: number[];
  minValues?: number[];
  maxValues?: number[];
  minDifference?: number;
  maxDifference?: number;
  timestamp: number;
}

export interface ClientMessage {
  type: string;
  array?: number[];
}

export interface ServerMessage {
  type: string;
  result?: PairResult;
  error?: string;
}

export const arrayInputSchema = z.object({
  array: z.array(z.number().int().min(1).max(1e5))
    .min(3, "Array must have at least 3 elements")
    .max(1e5, "Array must have at most 100000 elements")
});
