import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"), // admin, branch_manager, customer
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number"),
  bankingId: text("banking_id").unique(),
  branchId: text("branch_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tiers = pgTable("tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  minimumPoints: integer("minimum_points").notNull(),
  multiplier: decimal("multiplier").notNull().default("1.0"),
  benefits: jsonb("benefits").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  color: text("color").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customerTiers = pgTable("customer_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: text("customer_id").notNull(),
  tierId: text("tier_id").notNull(),
  achievedAt: timestamp("achieved_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const points = pgTable("points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: text("customer_id").notNull(),
  totalPoints: integer("total_points").notNull().default(0),
  availablePoints: integer("available_points").notNull().default(0),
  lifetimeEarned: integer("lifetime_earned").notNull().default(0),
  lifetimeRedeemed: integer("lifetime_redeemed").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: text("customer_id").notNull(),
  type: text("type").notNull(), // earn, redeem
  points: integer("points").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // transfer, bill_payment, savings, referral, etc.
  amount: decimal("amount"),
  currency: text("currency").default("ETB"),
  ruleId: text("rule_id"),
  campaignId: text("campaign_id"),
  status: text("status").notNull().default("completed"), // pending, completed, failed
  metadata: jsonb("metadata").$type<Record<string, any>>().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rules = pgTable("rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // banking, mobile_app, partner
  serviceType: text("service_type").notNull(), // transfer, bill_payment, login, etc.
  pointsPerUnit: integer("points_per_unit").notNull(),
  unit: text("unit").notNull(), // amount, action
  unitValue: decimal("unit_value").notNull(), // 1000 ETB, 1 action
  minimumAmount: decimal("minimum_amount"),
  maximumPoints: integer("maximum_points"),
  multiplier: decimal("multiplier").default("1.0"),
  conditions: jsonb("conditions").$type<Record<string, any>>().default(sql`'{}'::jsonb`),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // multiplier, bonus, special
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  rules: jsonb("rules").$type<Record<string, any>>().notNull(),
  targetCustomers: jsonb("target_customers").$type<string[]>().default(sql`'[]'::jsonb`),
  budget: integer("budget"), // maximum points to be issued
  spent: integer("spent").default(0),
  participants: integer("participants").default(0),
  status: text("status").notNull().default("active"), // active, inactive, ended
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // cashback, voucher, airtime
  cost: integer("cost").notNull(), // points required
  value: decimal("value").notNull(), // ETB value
  category: text("category").notNull(),
  provider: text("provider"),
  stock: integer("stock").default(-1), // -1 for unlimited
  terms: text("terms"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const redemptions = pgTable("redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: text("customer_id").notNull(),
  rewardId: text("reward_id").notNull(),
  pointsUsed: integer("points_used").notNull(),
  value: decimal("value").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  code: text("code"), // voucher code if applicable
  expiresAt: timestamp("expires_at"),
  redeemedAt: timestamp("redeemed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const branches = pgTable("branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  city: text("city").notNull(),
  region: text("region").notNull(),
  manager: text("manager"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTierSchema = createInsertSchema(tiers).omit({
  id: true,
  createdAt: true,
});

export const insertPointsSchema = createInsertSchema(points).omit({
  id: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertRuleSchema = createInsertSchema(rules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  createdAt: true,
});

export const insertRedemptionSchema = createInsertSchema(redemptions).omit({
  id: true,
  createdAt: true,
});

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
});

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// API schemas
export const earnPointsSchema = z.object({
  customerId: z.string(),
  category: z.string(),
  serviceType: z.string(),
  amount: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

export const redeemPointsSchema = z.object({
  customerId: z.string(),
  rewardId: z.string(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Tier = typeof tiers.$inferSelect;
export type InsertTier = z.infer<typeof insertTierSchema>;
export type CustomerTier = typeof customerTiers.$inferSelect;
export type Points = typeof points.$inferSelect;
export type InsertPoints = z.infer<typeof insertPointsSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Rule = typeof rules.$inferSelect;
export type InsertRule = z.infer<typeof insertRuleSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Redemption = typeof redemptions.$inferSelect;
export type InsertRedemption = z.infer<typeof insertRedemptionSchema>;
export type Branch = typeof branches.$inferSelect;
export type InsertBranch = z.infer<typeof insertBranchSchema>;

export type LoginCredentials = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type EarnPointsRequest = z.infer<typeof earnPointsSchema>;
export type RedeemPointsRequest = z.infer<typeof redeemPointsSchema>;
