// Product IDs from Whop dashboard
export const PRODUCTS = {
  FREE: "prod_OVVaWf1nemJrp",
  MAX_BET_POTD: "prod_12U89lKiPpVxP",
  PREMIUM: "prod_o1jjamUG8rP8W",
  PLAYER_PROPS: "prod_RYRii4L26sK9m",
  HIGH_ROLLERS: "prod_bNsUIqwSfzLzU",
} as const;

// Your Whop company ID (find it in your dashboard URL: whop.com/dashboard/biz_xxxxxxxxx)
export const COMPANY_ID = "biz_KfwlM1WObd2QW6"; // Replace with your actual company ID

// These tiers can see straight bet plays
export const PREMIUM_TIERS = [PRODUCTS.PREMIUM, PRODUCTS.HIGH_ROLLERS];

// These tiers see the paywall
export const PAYWALLED_TIERS = [
  PRODUCTS.FREE,
  PRODUCTS.PLAYER_PROPS,
  PRODUCTS.MAX_BET_POTD,
];
