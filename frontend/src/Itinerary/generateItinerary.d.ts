type ItineraryOptions = {
  destination?: string;
  travellers?: number;
  duration?: number;
  pace?: string;
  interests?: string[];
  dietary?: string;
  foodChoices?: Record<string, unknown>;
  extraFoodPrefs?: string[];
  allergies?: string;
  budgetTier?: string;
  customBudget?: number | string | null;
  startDate?: string;
  startingCity?: string;
};

export const DESTINATION_PRESETS: Array<{
  id: string;
  name: string;
  daysRec: number;
  popular: boolean;
}>;

export const INTEREST_CATEGORIES: Array<{
  id: string;
  title: string;
  icon: string;
  desc: string;
}>;

export const FOOD_PREFERENCE_OPTIONS: Array<{
  id: string;
  label: string;
  note: string;
}>;

export const INDIVIDUAL_FOOD_ITEMS: Array<{
  id: string;
  name: string;
  defaultVeg: boolean;
}>;

export const EXTRA_FOOD_PREFS: Array<{
  id: string;
  label: string;
}>;

export function evaluateDietarySafety(
  restaurantName: string,
  userDietary: string,
  extraPrefs: string[],
  allergies: string,
): {
  statusBadge: string;
  statusType: string;
  note: string;
};

export function generateFullItinerary(options?: ItineraryOptions): Promise<any>;
