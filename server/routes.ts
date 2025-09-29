import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { authenticateToken, authorizeRoles, generateToken } from "./middleware/auth";
import { 
  loginSchema, registerSchema, earnPointsSchema, redeemPointsSchema,
  insertRuleSchema, insertCampaignSchema, insertRewardSchema, insertTierSchema
} from "@shared/schema";

import type { Request } from "express";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    username: string;
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username) || 
                   await storage.getUserByEmail(username);
      
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken({
        id: user.id,
        role: user.role,
        username: user.username,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const { confirmPassword, ...insertData } = userData;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(insertData.username) ||
                          await storage.getUserByEmail(insertData.email);
      
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const user = await storage.createUser(insertData);
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Points API routes
  app.post("/api/earnPoints", authenticateToken, async (req, res) => {
    try {
      const { customerId, category, serviceType, amount, metadata } = earnPointsSchema.parse(req.body);
      
      // Find applicable rule
      const rules = await storage.getActiveRules();
      const rule = rules.find(r => r.category === category && r.serviceType === serviceType);
      
      if (!rule) {
        return res.status(400).json({ message: "No earning rule found for this service" });
      }

      // Calculate points based on rule
      let points = 0;
      if (rule.unit === "amount" && amount) {
        const unitValue = parseFloat(rule.unitValue);
        points = Math.floor((amount / unitValue) * rule.pointsPerUnit);
      } else if (rule.unit === "action") {
        points = rule.pointsPerUnit;
      }

      // Apply tier multiplier
      const customer = await storage.getUser(customerId);
      if (customer) {
        const tier = await storage.getCustomerCurrentTier(customerId);
        if (tier) {
          points = Math.floor(points * parseFloat(tier.multiplier));
        }
      }

      // Apply daily/monthly limits if specified
      if (rule.maximumPoints && points > rule.maximumPoints) {
        points = rule.maximumPoints;
      }

      // Create transaction
      const transaction = await storage.createTransaction({
        customerId,
        type: "earn",
        points,
        description: `Points earned from ${rule.name}`,
        category,
        amount: amount?.toString(),
        currency: "ETB",
        ruleId: rule.id,
        status: "completed",
        metadata: metadata || {},
      });

      res.json({ transaction, pointsEarned: points });
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });

  app.post("/api/redeemPoints", authenticateToken, async (req, res) => {
    try {
      const { customerId, rewardId } = redeemPointsSchema.parse(req.body);
      
      // Get customer points and reward
      const customerPoints = await storage.getCustomerPoints(customerId);
      const reward = await storage.getRewardById(rewardId);
      
      if (!customerPoints || !reward) {
        return res.status(404).json({ message: "Customer or reward not found" });
      }

      if (!reward.isActive) {
        return res.status(400).json({ message: "Reward is not available" });
      }

      if (customerPoints.availablePoints < reward.cost) {
        return res.status(400).json({ message: "Insufficient points" });
      }

      // Check stock
      if (reward.stock !== -1 && reward.stock !== null && reward.stock <= 0) {
        return res.status(400).json({ message: "Reward is out of stock" });
      }

      // Create redemption
      const redemption = await storage.createRedemption({
        customerId,
        rewardId,
        pointsUsed: reward.cost,
        value: reward.value,
        status: "completed",
        code: reward.type === "voucher" ? `CBO-${Date.now()}` : undefined,
        expiresAt: reward.type === "voucher" ? new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) : undefined,
        redeemedAt: new Date(),
      });

      // Create transaction record
      const transaction = await storage.createTransaction({
        customerId,
        type: "redeem",
        points: reward.cost,
        description: `Redeemed ${reward.name}`,
        category: reward.category,
        amount: reward.value,
        currency: "ETB",
        status: "completed",
        metadata: { redemptionId: redemption.id } as Record<string, any>,
      });

      // Update reward stock
      if (reward.stock !== null && reward.stock > 0) {
        await storage.updateReward(rewardId, { stock: reward.stock - 1 });
      }

      res.json({ redemption, transaction });
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });

  app.get("/api/checkBalance/:customerId", authenticateToken, async (req, res) => {
    try {
      const { customerId } = req.params;
      const points = await storage.getCustomerPoints(customerId);
      
      if (!points) {
        return res.status(404).json({ message: "Customer not found" });
      }

      const tier = await storage.getCustomerCurrentTier(customerId);
      res.json({ points, tier });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/getHistory/:customerId", authenticateToken, async (req, res) => {
    try {
      const { customerId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const transactions = await storage.getCustomerTransactions(customerId, limit);
      res.json({ transactions });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin routes
  app.get("/api/admin/dashboard", authenticateToken, authorizeRoles(["admin", "branch_manager"]), async (req, res) => {
    try {
      const totalCustomers = await storage.getTotalCustomers();
      const totalPointsIssued = await storage.getTotalPointsIssued();
      const totalPointsRedeemed = await storage.getTotalPointsRedeemed();
      const branchMetrics = await storage.getBranchMetrics();
      const recentActivity = await storage.getRecentActivity(10);
      const activeCampaigns = await storage.getActiveCampaigns();

      res.json({
        metrics: {
          totalCustomers,
          totalPointsIssued,
          totalPointsRedeemed,
          activeCampaigns: activeCampaigns.length,
        },
        branchMetrics,
        recentActivity,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Rules management
  app.get("/api/admin/rules", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
    try {
      const rules = await storage.getRules();
      res.json({ rules });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/admin/rules", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
    try {
      const ruleData = insertRuleSchema.parse(req.body);
      const rule = await storage.createRule(ruleData);
      res.status(201).json({ rule });
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });

  app.put("/api/admin/rules/:id", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const rule = await storage.updateRule(id, updates);
      
      if (!rule) {
        return res.status(404).json({ message: "Rule not found" });
      }
      
      res.json({ rule });
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });

  // Tier management
  app.get("/api/admin/tiers", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
    try {
      const tiers = await storage.getTiers();
      res.json({ tiers });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/admin/tiers", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
    try {
      const tierData = insertTierSchema.parse(req.body);
      const tier = await storage.createTier(tierData);
      res.status(201).json({ tier });
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });

  // Campaign management
  app.get("/api/admin/campaigns", authenticateToken, authorizeRoles(["admin", "branch_manager"]), async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json({ campaigns });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/admin/campaigns", authenticateToken, authorizeRoles(["admin"]), async (req: AuthRequest, res) => {
    try {
      const campaignData = { ...req.body, createdBy: req.user!.id };
      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json({ campaign });
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });

  // Reward management
  app.get("/api/rewards", authenticateToken, async (req, res) => {
    try {
      const rewards = await storage.getActiveRewards();
      res.json({ rewards });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/admin/rewards", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
    try {
      const rewardData = insertRewardSchema.parse(req.body);
      const reward = await storage.createReward(rewardData);
      res.status(201).json({ reward });
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });

  // Customer management
  app.get("/api/admin/customers", authenticateToken, authorizeRoles(["admin", "branch_manager"]), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const customers = await storage.getAllCustomers();
      
      // Add tier and points info to customer data
      const customersWithDetails = await Promise.all(customers.map(async (customer) => {
        const points = await storage.getCustomerPoints(customer.id);
        const tier = await storage.getCustomerCurrentTier(customer.id);
        
        return {
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          phone: customer.phoneNumber,
          tier: tier?.name || "Silver",
          points: points?.availablePoints || 0,
          status: customer.isActive ? "Active" : "Inactive", 
          joinDate: customer.createdAt,
          lastActivity: customer.updatedAt,
        };
      }));
      
      res.json({ customers: customersWithDetails.slice(0, limit) });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
