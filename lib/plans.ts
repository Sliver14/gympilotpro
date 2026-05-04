export const PLANS = {
  starter: {
    id: 'starter',
    name: "Starter",
    setupFee: 0, // Free setup for now (key for adoption)
    monthlyFee: 15000,
    features: [
      "Up to 200 Members",
      "Automated WhatsApp Reminders",
      "Revenue Tracking Dashboard",
      "QR Check-in Access Control",
    ],
  },

  pro: {
    id: 'pro',
    name: "Pro",
    setupFee: 0,
    monthlyFee: 25000,
    features: [
      "Up to 500 Members",
      "Custom Subdomain",
      "Full Automation Suite",
      "Advanced Revenue Analytics",
      "Priority Support",
    ],
  },

  elite: {
    id: 'elite',
    name: "Elite",
    setupFee: 0,
    monthlyFee: 45000,
    features: [
      "Unlimited Members",
      "Custom Domain",
      "Multi-Branch Support",
      "Advanced Analytics + Insights",
      "Priority Support",
      "Dedicated Onboarding Support",
    ],
  }
};

export const DURATIONS = [
  { months: 1, label: "1 Month", discount: 0 },
  { months: 3, label: "3 Months", discount: 0.05 },
  { months: 6, label: "6 Months", discount: 0.10 },
  { months: 12, label: "12 Months", discount: 0.15 },
];

export const PLAN_WEIGHTS = { starter: 1, pro: 2, elite: 3 };
export const PLAN_LIMITS: Record<string, number> = {
  starter: 200,
  pro: 500,
  elite: Infinity
};

export function hasPremiumAccess(currentPlan: string, requiredPlan: 'pro' | 'elite') {
  const currentWeight = PLAN_WEIGHTS[currentPlan as keyof typeof PLAN_WEIGHTS] || 1;
  const requiredWeight = PLAN_WEIGHTS[requiredPlan];
  return currentWeight >= requiredWeight;
}

export type PlanKey = keyof typeof PLANS;

export function calculatePrice(planKey: PlanKey, months: number, isNewGym: boolean, currentPlanKey?: PlanKey) {
  const plan = PLANS[planKey];
  const duration = DURATIONS.find(d => d.months === months) || DURATIONS[0];
  
  let total = 0;
  let setupFeeCharge = 0;
  
  if (isNewGym) {
    // New gym pays full setup fee
    setupFeeCharge = plan.setupFee;
  } else if (currentPlanKey && planKey !== currentPlanKey) {
    // Check if it's an upgrade
    const currentPlan = PLANS[currentPlanKey];
    if (plan.setupFee > currentPlan.setupFee) {
      // Pay the difference in setup fees for upgrades
      setupFeeCharge = plan.setupFee - currentPlan.setupFee;
    }
  }

  const monthlyTotal = plan.monthlyFee * months * (1 - duration.discount);
  total = setupFeeCharge + monthlyTotal;

  return {
    total,
    setupFeeCharge,
    monthlyTotal,
    discountAmount: plan.monthlyFee * months * duration.discount
  };
}

export function calculateUpgradePrice(
  currentPlanKey: PlanKey,
  newPlanKey: PlanKey,
  endDate: Date,
  newMonths: number
) {
  const currentPlan = PLANS[currentPlanKey];
  const newPlan = PLANS[newPlanKey];
  const duration = DURATIONS.find(d => d.months === newMonths) || DURATIONS[0];

  const now = new Date();
  const timeRemaining = endDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));
  
  // Calculate value of remaining time on current plan (assuming 30-day month for simple math)
  const currentDailyRate = currentPlan.monthlyFee / 30;
  const unusedCredit = currentDailyRate * daysRemaining;

  // New plan setup fee difference
  const setupFeeDiff = Math.max(0, newPlan.setupFee - currentPlan.setupFee);

  // New plan cost for the selected duration
  const newPlanTotal = newPlan.monthlyFee * newMonths * (1 - duration.discount);

  // Final total = (New Plan Cost + Setup Diff) - Unused Credit
  // Minimum 1000 NGN to cover transaction costs
  const total = Math.max(1000, (newPlanTotal + setupFeeDiff) - unusedCredit); 

  return {
    total: Math.round(total),
    setupFeeDiff: Math.round(setupFeeDiff),
    newPlanTotal: Math.round(newPlanTotal),
    unusedCredit: Math.round(unusedCredit),
    daysRemaining
  };
}
