import { 
  type User, type InsertUser, type Tier, type InsertTier, type CustomerTier,
  type Points, type InsertPoints, type Transaction, type InsertTransaction,
  type Rule, type InsertRule, type Campaign, type InsertCampaign,
  type Reward, type InsertReward, type Redemption, type InsertRedemption,
  type Branch, type InsertBranch
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllCustomers(): Promise<User[]>;
  
  // Points
  getCustomerPoints(customerId: string): Promise<Points | undefined>;
  updatePoints(customerId: string, updates: Partial<Points>): Promise<Points>;
  
  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getCustomerTransactions(customerId: string, limit?: number): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | undefined>;
  
  // Rules
  getRules(): Promise<Rule[]>;
  getActiveRules(): Promise<Rule[]>;
  getRuleById(id: string): Promise<Rule | undefined>;
  createRule(rule: InsertRule): Promise<Rule>;
  updateRule(id: string, updates: Partial<Rule>): Promise<Rule | undefined>;
  deleteRule(id: string): Promise<boolean>;
  
  // Tiers
  getTiers(): Promise<Tier[]>;
  getTierById(id: string): Promise<Tier | undefined>;
  createTier(tier: InsertTier): Promise<Tier>;
  updateTier(id: string, updates: Partial<Tier>): Promise<Tier | undefined>;
  getCustomerCurrentTier(customerId: string): Promise<Tier | undefined>;
  updateCustomerTier(customerId: string, tierId: string): Promise<CustomerTier>;
  
  // Campaigns
  getCampaigns(): Promise<Campaign[]>;
  getActiveCampaigns(): Promise<Campaign[]>;
  getCampaignById(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | undefined>;
  
  // Rewards
  getRewards(): Promise<Reward[]>;
  getActiveRewards(): Promise<Reward[]>;
  getRewardById(id: string): Promise<Reward | undefined>;
  createReward(reward: InsertReward): Promise<Reward>;
  updateReward(id: string, updates: Partial<Reward>): Promise<Reward | undefined>;
  
  // Redemptions
  createRedemption(redemption: InsertRedemption): Promise<Redemption>;
  getCustomerRedemptions(customerId: string): Promise<Redemption[]>;
  getRedemptionById(id: string): Promise<Redemption | undefined>;
  updateRedemption(id: string, updates: Partial<Redemption>): Promise<Redemption | undefined>;
  
  // Branches
  getBranches(): Promise<Branch[]>;
  getBranchById(id: string): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  
  // Analytics
  getTotalCustomers(): Promise<number>;
  getTotalPointsIssued(): Promise<number>;
  getTotalPointsRedeemed(): Promise<number>;
  getBranchMetrics(): Promise<Array<{branchId: string; branchName: string; customers: number; points: number}>>;
  getRecentActivity(limit: number): Promise<Transaction[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private points: Map<string, Points>;
  private transactions: Map<string, Transaction>;
  private rules: Map<string, Rule>;
  private tiers: Map<string, Tier>;
  private customerTiers: Map<string, CustomerTier>;
  private campaigns: Map<string, Campaign>;
  private rewards: Map<string, Reward>;
  private redemptions: Map<string, Redemption>;
  private branches: Map<string, Branch>;

  constructor() {
    this.users = new Map();
    this.points = new Map();
    this.transactions = new Map();
    this.rules = new Map();
    this.tiers = new Map();
    this.customerTiers = new Map();
    this.campaigns = new Map();
    this.rewards = new Map();
    this.redemptions = new Map();
    this.branches = new Map();
    
    // Initialize with default data
    this.initializeDefaults();
  }

  private async initializeDefaults() {
    // Create default admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      email: "admin@cbo.et",
      password: adminPassword,
      role: "admin",
      firstName: "System",
      lastName: "Administrator",
      phoneNumber: "+251911000000",
      bankingId: "CBO-ADMIN-001",
      branchId: "main-branch",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample customer
    const customerPassword = await bcrypt.hash("customer123", 10);
    const customer: User = {
      id: randomUUID(),
      username: "johndoe",
      email: "john@example.com",
      password: customerPassword,
      role: "customer",
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "+251911123456",
      bankingId: "CBO-CUST-001",
      branchId: "main-branch",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(customer.id, customer);

    // Create default tiers
    const silverTier: Tier = {
      id: randomUUID(),
      name: "Silver",
      minimumPoints: 0,
      multiplier: "1.0",
      benefits: ["Basic support", "Standard processing"],
      color: "#C0C0C0",
      isActive: true,
      createdAt: new Date(),
    };
    this.tiers.set(silverTier.id, silverTier);

    const goldTier: Tier = {
      id: randomUUID(),
      name: "Gold",
      minimumPoints: 5000,
      multiplier: "1.5",
      benefits: ["Priority support", "1.5x points", "Birthday bonus", "Exclusive offers"],
      color: "#FFD700",
      isActive: true,
      createdAt: new Date(),
    };
    this.tiers.set(goldTier.id, goldTier);

    const platinumTier: Tier = {
      id: randomUUID(),
      name: "Platinum",
      minimumPoints: 15000,
      multiplier: "2.0",
      benefits: ["VIP support", "2x points", "Premium rewards", "Concierge service"],
      color: "#E5E4E2",
      isActive: true,
      createdAt: new Date(),
    };
    this.tiers.set(platinumTier.id, platinumTier);

    // Set customer tier
    const customerTier: CustomerTier = {
      id: randomUUID(),
      customerId: customer.id,
      tierId: goldTier.id,
      achievedAt: new Date(),
      isActive: true,
    };
    this.customerTiers.set(customer.id, customerTier);

    // Create customer points
    const customerPoints: Points = {
      id: randomUUID(),
      customerId: customer.id,
      totalPoints: 12450,
      availablePoints: 12450,
      lifetimeEarned: 45780,
      lifetimeRedeemed: 33330,
      updatedAt: new Date(),
    };
    this.points.set(customer.id, customerPoints);

    // Create default rules
    const transferRule: Rule = {
      id: randomUUID(),
      name: "Account Transfers",
      category: "banking",
      serviceType: "transfer",
      pointsPerUnit: 10,
      unit: "amount",
      unitValue: "1000",
      minimumAmount: "100",
      maximumPoints: 1000,
      multiplier: "1.0",
      conditions: {},
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.rules.set(transferRule.id, transferRule);

    const billPaymentRule: Rule = {
      id: randomUUID(),
      name: "Bill Payments",
      category: "banking",
      serviceType: "bill_payment",
      pointsPerUnit: 5,
      unit: "amount",
      unitValue: "500",
      minimumAmount: "50",
      maximumPoints: 500,
      multiplier: "1.0",
      conditions: { autopay_bonus: 2 },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.rules.set(billPaymentRule.id, billPaymentRule);

    const loginRule: Rule = {
      id: randomUUID(),
      name: "Daily Login",
      category: "mobile_app",
      serviceType: "login",
      pointsPerUnit: 5,
      unit: "action",
      unitValue: "1",
      minimumAmount: null,
      maximumPoints: 5,
      multiplier: "1.0",
      conditions: { streak_bonus: 50 },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.rules.set(loginRule.id, loginRule);

    // Create default rewards
    const cashbackReward: Reward = {
      id: randomUUID(),
      name: "Cashback",
      description: "Direct cash transfer to your account",
      type: "cashback",
      cost: 1000,
      value: "100",
      category: "cash",
      provider: "CBO",
      stock: -1,
      terms: "Cashback will be processed within 24 hours",
      isActive: true,
      createdAt: new Date(),
    };
    this.rewards.set(cashbackReward.id, cashbackReward);

    const voucherReward: Reward = {
      id: randomUUID(),
      name: "Shopping Voucher",
      description: "Use at partner stores",
      type: "voucher",
      cost: 800,
      value: "100",
      category: "shopping",
      provider: "Partner Stores",
      stock: 100,
      terms: "Valid for 6 months from redemption date",
      isActive: true,
      createdAt: new Date(),
    };
    this.rewards.set(voucherReward.id, voucherReward);

    // Create main branch
    const mainBranch: Branch = {
      id: "main-branch",
      name: "Addis Ababa Main Branch",
      code: "AA-MAIN",
      city: "Addis Ababa",
      region: "Addis Ababa",
      manager: "Alemayehu Tadesse",
      isActive: true,
      createdAt: new Date(),
    };
    this.branches.set(mainBranch.id, mainBranch);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getAllCustomers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === "customer");
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      id,
      username: insertUser.username,
      email: insertUser.email,
      password: hashedPassword,
      role: insertUser.role || "customer",
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      phoneNumber: insertUser.phoneNumber || null,
      bankingId: insertUser.bankingId || null,
      branchId: insertUser.branchId || null,
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);

    // Create initial points record
    const points: Points = {
      id: randomUUID(),
      customerId: id,
      totalPoints: 0,
      availablePoints: 0,
      lifetimeEarned: 0,
      lifetimeRedeemed: 0,
      updatedAt: new Date(),
    };
    this.points.set(id, points);

    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Points methods
  async getCustomerPoints(customerId: string): Promise<Points | undefined> {
    return this.points.get(customerId);
  }

  async updatePoints(customerId: string, updates: Partial<Points>): Promise<Points> {
    const existing = this.points.get(customerId);
    const points: Points = {
      id: existing?.id || randomUUID(),
      customerId,
      totalPoints: 0,
      availablePoints: 0,
      lifetimeEarned: 0,
      lifetimeRedeemed: 0,
      updatedAt: new Date(),
      ...existing,
      ...updates,
    };
    this.points.set(customerId, points);
    return points;
  }

  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);

    // Update customer points
    const currentPoints = await this.getCustomerPoints(transaction.customerId);
    if (currentPoints) {
      if (transaction.type === "earn") {
        await this.updatePoints(transaction.customerId, {
          totalPoints: currentPoints.totalPoints + transaction.points,
          availablePoints: currentPoints.availablePoints + transaction.points,
          lifetimeEarned: currentPoints.lifetimeEarned + transaction.points,
        });
      } else if (transaction.type === "redeem") {
        await this.updatePoints(transaction.customerId, {
          totalPoints: currentPoints.totalPoints - transaction.points,
          availablePoints: currentPoints.availablePoints - transaction.points,
          lifetimeRedeemed: currentPoints.lifetimeRedeemed + transaction.points,
        });
      }
    }

    return transaction;
  }

  async getCustomerTransactions(customerId: string, limit: number = 50): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.customerId === customerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  // Rule methods
  async getRules(): Promise<Rule[]> {
    return Array.from(this.rules.values());
  }

  async getActiveRules(): Promise<Rule[]> {
    return Array.from(this.rules.values()).filter(rule => rule.isActive);
  }

  async getRuleById(id: string): Promise<Rule | undefined> {
    return this.rules.get(id);
  }

  async createRule(insertRule: InsertRule): Promise<Rule> {
    const id = randomUUID();
    const rule: Rule = {
      ...insertRule,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.rules.set(id, rule);
    return rule;
  }

  async updateRule(id: string, updates: Partial<Rule>): Promise<Rule | undefined> {
    const rule = this.rules.get(id);
    if (!rule) return undefined;

    const updatedRule = { ...rule, ...updates, updatedAt: new Date() };
    this.rules.set(id, updatedRule);
    return updatedRule;
  }

  async deleteRule(id: string): Promise<boolean> {
    return this.rules.delete(id);
  }

  // Tier methods
  async getTiers(): Promise<Tier[]> {
    return Array.from(this.tiers.values()).sort((a, b) => a.minimumPoints - b.minimumPoints);
  }

  async getTierById(id: string): Promise<Tier | undefined> {
    return this.tiers.get(id);
  }

  async createTier(insertTier: InsertTier): Promise<Tier> {
    const id = randomUUID();
    const tier: Tier = {
      ...insertTier,
      id,
      createdAt: new Date(),
    };
    this.tiers.set(id, tier);
    return tier;
  }

  async updateTier(id: string, updates: Partial<Tier>): Promise<Tier | undefined> {
    const tier = this.tiers.get(id);
    if (!tier) return undefined;

    const updatedTier = { ...tier, ...updates };
    this.tiers.set(id, updatedTier);
    return updatedTier;
  }

  async getCustomerCurrentTier(customerId: string): Promise<Tier | undefined> {
    const customerTier = this.customerTiers.get(customerId);
    if (!customerTier) return undefined;
    return this.tiers.get(customerTier.tierId);
  }

  async updateCustomerTier(customerId: string, tierId: string): Promise<CustomerTier> {
    const customerTier: CustomerTier = {
      id: randomUUID(),
      customerId,
      tierId,
      achievedAt: new Date(),
      isActive: true,
    };
    this.customerTiers.set(customerId, customerTier);
    return customerTier;
  }

  // Campaign methods
  async getCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    const now = new Date();
    return Array.from(this.campaigns.values()).filter(
      campaign => campaign.status === "active" && 
      campaign.startDate <= now && 
      campaign.endDate >= now
    );
  }

  async getCampaignById(id: string): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = randomUUID();
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;

    const updatedCampaign = { ...campaign, ...updates, updatedAt: new Date() };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  // Reward methods
  async getRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values());
  }

  async getActiveRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(reward => reward.isActive);
  }

  async getRewardById(id: string): Promise<Reward | undefined> {
    return this.rewards.get(id);
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const id = randomUUID();
    const reward: Reward = {
      ...insertReward,
      id,
      createdAt: new Date(),
    };
    this.rewards.set(id, reward);
    return reward;
  }

  async updateReward(id: string, updates: Partial<Reward>): Promise<Reward | undefined> {
    const reward = this.rewards.get(id);
    if (!reward) return undefined;

    const updatedReward = { ...reward, ...updates };
    this.rewards.set(id, updatedReward);
    return updatedReward;
  }

  // Redemption methods
  async createRedemption(insertRedemption: InsertRedemption): Promise<Redemption> {
    const id = randomUUID();
    const redemption: Redemption = {
      ...insertRedemption,
      id,
      createdAt: new Date(),
    };
    this.redemptions.set(id, redemption);
    return redemption;
  }

  async getCustomerRedemptions(customerId: string): Promise<Redemption[]> {
    return Array.from(this.redemptions.values())
      .filter(r => r.customerId === customerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRedemptionById(id: string): Promise<Redemption | undefined> {
    return this.redemptions.get(id);
  }

  async updateRedemption(id: string, updates: Partial<Redemption>): Promise<Redemption | undefined> {
    const redemption = this.redemptions.get(id);
    if (!redemption) return undefined;

    const updatedRedemption = { ...redemption, ...updates };
    this.redemptions.set(id, updatedRedemption);
    return updatedRedemption;
  }

  // Branch methods
  async getBranches(): Promise<Branch[]> {
    return Array.from(this.branches.values());
  }

  async getBranchById(id: string): Promise<Branch | undefined> {
    return this.branches.get(id);
  }

  async createBranch(insertBranch: InsertBranch): Promise<Branch> {
    const id = randomUUID();
    const branch: Branch = {
      ...insertBranch,
      id,
      createdAt: new Date(),
    };
    this.branches.set(id, branch);
    return branch;
  }

  // Analytics methods
  async getTotalCustomers(): Promise<number> {
    return Array.from(this.users.values()).filter(user => user.role === "customer").length;
  }

  async getTotalPointsIssued(): Promise<number> {
    return Array.from(this.transactions.values())
      .filter(t => t.type === "earn")
      .reduce((sum, t) => sum + t.points, 0);
  }

  async getTotalPointsRedeemed(): Promise<number> {
    return Array.from(this.transactions.values())
      .filter(t => t.type === "redeem")
      .reduce((sum, t) => sum + t.points, 0);
  }

  async getBranchMetrics(): Promise<Array<{branchId: string; branchName: string; customers: number; points: number}>> {
    const branches = await this.getBranches();
    return branches.map(branch => {
      const customers = Array.from(this.users.values()).filter(user => user.branchId === branch.id).length;
      const branchCustomerIds = Array.from(this.users.values())
        .filter(user => user.branchId === branch.id)
        .map(user => user.id);
      const points = Array.from(this.transactions.values())
        .filter(t => branchCustomerIds.includes(t.customerId) && t.type === "earn")
        .reduce((sum, t) => sum + t.points, 0);

      return {
        branchId: branch.id,
        branchName: branch.name,
        customers,
        points,
      };
    });
  }

  async getRecentActivity(limit: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
