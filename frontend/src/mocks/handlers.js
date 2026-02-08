import { http, HttpResponse } from 'msw';

export const handlers = [
  // Intercept the food analysis request
  http.post('*/analyze', async () => {
    return HttpResponse.json({
      success: true,
      food_name: "Mock Healthy Salad",
      traffic_light: "green",
      verdict_title: "Safe to eat",
      nutrition: {
        calories: 150,
        protein_g: 5,
        fat_g: 2,
        carbs_g: 10
      },
      reason: "High in fiber and low in saturated fats.",
      alternatives: []
    });
  }),
];