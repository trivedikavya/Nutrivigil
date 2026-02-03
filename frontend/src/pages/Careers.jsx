import React from 'react';
import { Link } from 'react-router-dom';

const Careers = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center max-w-2xl">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Careers at NutriVigil
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                    Join our team and help build the future of nutrition technology.
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

export default Careers;