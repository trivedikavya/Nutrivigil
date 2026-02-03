import React from 'react';
import { Link } from 'react-router-dom';

const NutritionDecoded = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center max-w-2xl">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Nutrition Decoded
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                    Discover the science behind your favorite foods with our detailed nutrition analysis.
                </p>
                <span className="inline-block px-6 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    🚧 Coming Soon
                </span>
                <div className="mt-8">
                    <Link to="/" className="text-blue-600 hover:underline">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NutritionDecoded;
