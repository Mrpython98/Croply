import type { Priority } from "@/lib/types";

export const PRIORITIES: Priority[] = [
  {
    key: "minimize_irrigation",
    label: "Minimize Irrigation",
    description: "Prioritize rotations that reduce water use and match local rainfall patterns.",
    icon: "Droplets",
    weights: {
      waterUse: 0.4,
      nitrogenFixation: 0.1,
      organicMatter: 0.15,
      droughtTolerance: 0.25,
      yieldPotential: 0.1,
    },
  },
  {
    key: "restore_nitrogen",
    label: "Restore Nitrogen",
    description: "Rebuild soil nitrogen through legumes and cover crops to reduce fertilizer costs.",
    icon: "FlaskConical",
    weights: {
      waterUse: 0.1,
      nitrogenFixation: 0.4,
      organicMatter: 0.25,
      droughtTolerance: 0.1,
      yieldPotential: 0.15,
    },
  },
  {
    key: "build_organic_matter",
    label: "Build Organic Matter",
    description: "Increase soil carbon and structure through cover crops and diverse residue returns.",
    icon: "Leaf",
    weights: {
      waterUse: 0.1,
      nitrogenFixation: 0.2,
      organicMatter: 0.4,
      droughtTolerance: 0.15,
      yieldPotential: 0.15,
    },
  },
  {
    key: "drought_resilience",
    label: "Drought Resilience",
    description: "Select rotations that tolerate heat waves and water scarcity under warming trends.",
    icon: "Sun",
    weights: {
      waterUse: 0.2,
      nitrogenFixation: 0.1,
      organicMatter: 0.15,
      droughtTolerance: 0.4,
      yieldPotential: 0.15,
    },
  },
  {
    key: "maximize_yield",
    label: "Maximize Yield",
    description: "Optimize for production output balanced with soil sustainability over the 3-year cycle.",
    icon: "TrendingUp",
    weights: {
      waterUse: 0.15,
      nitrogenFixation: 0.2,
      organicMatter: 0.2,
      droughtTolerance: 0.15,
      yieldPotential: 0.3,
    },
  },
];
