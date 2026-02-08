import { http, HttpResponse } from 'msw';

export const handlers = [
  // Explicitly match the URL used in ScanPage.jsx
  http.post('https://nutb.onrender.com/analyze', async () => {
    return HttpResponse.json({
      success: true,
      food_name: "Mock Healthy Salad",
      traffic_light: "green",
      verdict_title: "Safe to eat",
      reason: "High in fiber.",
      alternatives: []
    });
  }),
];