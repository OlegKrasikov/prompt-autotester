import { Scenario } from "./types";

export const SCENARIOS: Scenario[] = [
  {
    key: "beauty-salon",
    name: "Customer x Beauty Salon",
    description: "Client booking a haircut appointment with a beauty salon receptionist.",
    seed: {
      title: "Booking a haircut appointment",
      messages: [
        {
          role: "user",
          content: "Hi! I'd like to book a haircut this Friday after 5pm if possible.",
        },
        {
          role: "assistant",
          content:
            "Of course! May I have your name, preferred stylist, and any add-on services?",
        },
        {
          role: "user",
          content: "I'm Alex. No stylist preference. Haircut + beard trim, please.",
        },
      ],
    },
  },
  {
    key: "food-delivery",
    name: "Customer x Food Delivery",
    description: "User tracking a late order with a food delivery support agent.",
    seed: {
      title: "Where is my order?",
      messages: [
        {
          role: "user",
          content: "My order is 20 minutes late. Can you check the status?",
        },
        {
          role: "assistant",
          content: "I'm checking that now. Could you share your order number, please?",
        },
      ],
    },
  },
];

export function getScenarioByKey(key: string) {
  return SCENARIOS.find((s) => s.key === key);
}


