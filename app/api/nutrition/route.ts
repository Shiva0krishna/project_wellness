import { NextResponse } from 'next/server';

// This is a mock implementation. In a real application, you would:
// 1. Use a real nutrition API (like Edamam, Nutritionix, or USDA)
// 2. Add proper error handling and rate limiting
// 3. Add API key management
// 4. Add caching for frequently requested items

const mockNutritionData: Record<string, {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
}> = {
  'apple': {
    calories: 95,
    protein: 0.5,
    carbohydrates: 25,
    fat: 0.3,
    fiber: 4.5
  },
  'chicken breast': {
    calories: 165,
    protein: 31,
    carbohydrates: 0,
    fat: 3.6,
    fiber: 0
  },
  'banana': {
    calories: 105,
    protein: 1.3,
    carbohydrates: 27,
    fat: 0.4,
    fiber: 3.1
  }
};

export async function POST(request: Request) {
  try {
    const { foodItem } = await request.json();

    if (!foodItem) {
      return NextResponse.json(
        { error: 'Food item is required' },
        { status: 400 }
      );
    }

    const normalizedFoodItem = foodItem.toLowerCase().trim();
    const nutritionInfo = mockNutritionData[normalizedFoodItem];

    if (!nutritionInfo) {
      return NextResponse.json(
        { error: 'Nutrition information not found for this food item' },
        { status: 404 }
      );
    }

    return NextResponse.json(nutritionInfo);
  } catch (error) {
    console.error('Error processing nutrition request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 