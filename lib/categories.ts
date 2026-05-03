import type { Category, TxKind } from "./types";

export const EXPENSE_CATEGORIES: Category[] = [
  "Food Delivery",
  "Groceries",
  "Restaurants",
  "Transport",
  "Rent & Bills",
  "Shopping",
  "Entertainment",
  "Health",
  "Travel",
  "Subscriptions",
  "Education",
  "Other",
];

export const INCOME_CATEGORIES: Category[] = ["Salary", "Other Income"];

export const ALL_CATEGORIES: Category[] = [
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES,
];

const RULES: { category: Category; patterns: RegExp[] }[] = [
  {
    category: "Food Delivery",
    patterns: [/uber\s*eats/i, /deliveroo/i, /just\s*eat/i, /doordash/i, /grubhub/i, /meituan/i, /ele\.?me/i],
  },
  {
    category: "Groceries",
    patterns: [/tesco/i, /sainsbury/i, /lidl/i, /aldi/i, /asda/i, /waitrose/i, /walmart/i, /trader\s*joe/i, /whole\s*foods/i],
  },
  {
    category: "Restaurants",
    patterns: [/restaurant/i, /cafe|coffee|starbucks|costa|pret/i, /mcdonald|kfc|burger|pizza/i, /dining/i],
  },
  {
    category: "Transport",
    patterns: [/uber(?!\s*eats)/i, /lyft/i, /bolt/i, /tfl|oyster/i, /train|rail|metro|subway/i, /shell|bp|esso|petrol|fuel/i],
  },
  {
    category: "Rent & Bills",
    patterns: [/rent/i, /mortgage/i, /electric|gas\s*bill|water|council|broadband|internet|phone\s*bill|vodafone|ee|o2|three/i],
  },
  {
    category: "Shopping",
    patterns: [/amazon/i, /ebay/i, /asos/i, /zara|h&m|uniqlo|nike|adidas/i, /argos|ikea/i],
  },
  {
    category: "Entertainment",
    patterns: [/cinema|odeon|vue/i, /steam|playstation|xbox|nintendo/i, /concert|ticketmaster/i],
  },
  {
    category: "Subscriptions",
    patterns: [/netflix|spotify|apple\s*music|disney|hulu|youtube\s*premium|prime\s*video/i, /icloud|dropbox|github|chatgpt|openai|anthropic/i, /gym|fitness/i],
  },
  {
    category: "Health",
    patterns: [/pharmacy|boots|cvs|walgreens/i, /clinic|hospital|dentist|gp/i],
  },
  {
    category: "Travel",
    patterns: [/airbnb|hotel|booking\.com|expedia/i, /ryanair|easyjet|british\s*airways|airline/i],
  },
  {
    category: "Education",
    patterns: [/udemy|coursera|edx|tuition|university|school/i],
  },
  {
    category: "Salary",
    patterns: [/salary|payroll|wages/i],
  },
];

export function autoCategorize(merchant: string, kind: TxKind): Category {
  const text = merchant.trim();
  if (!text) return kind === "income" ? "Other Income" : "Other";
  for (const rule of RULES) {
    if (rule.patterns.some((re) => re.test(text))) {
      const isIncomeCat = INCOME_CATEGORIES.includes(rule.category);
      if (kind === "income" && isIncomeCat) return rule.category;
      if (kind === "expense" && !isIncomeCat) return rule.category;
    }
  }
  return kind === "income" ? "Other Income" : "Other";
}
