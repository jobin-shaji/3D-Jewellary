import React, { useState } from "react";
import { Search, Grid, List, Filter } from "lucide-react";
import objects from "../data/Objects"; // your actual data file
import { useCart } from "../context/CartContext"; // ✅ real CartContext import

export default function SearchObjects() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("Relevance");
  const [viewMode, setViewMode] = useState("grid");
  const { addItem } = useCart(); // ✅ use real cart context

  const filteredObjects = objects.filter((obj) =>
    obj.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Search</h1>
          <h2 className="text-4xl font-bold text-purple-300 mb-6">
            3D Objects
          </h2>
          <p className="text-purple-200 text-lg">
            Discover amazing 3D models from our premium collection
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-2xl mx-auto">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search 3D objects..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-purple-800/30 border border-purple-600/30 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-purple-800/30 border border-purple-600/30 rounded-lg px-4 py-2 text-white"
              >
                <option value="Relevance">Sort by Relevance</option>
                <option value="Price">Sort by Price</option>
                <option value="Name">Sort by Name</option>
              </select>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid"
                      ? "bg-purple-600 text-white"
                      : "bg-purple-800/30 text-purple-300"
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list"
                      ? "bg-purple-600 text-white"
                      : "bg-purple-800/30 text-purple-300"
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            <button className="flex items-center space-x-2 bg-purple-800/30 border border-purple-600/30 rounded-lg px-4 py-2 text-white hover:bg-purple-700/30 transition-colors">
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Results */}
        {filteredObjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-purple-300 text-lg">No objects found.</p>
          </div>
        ) : (
          <div
            className={`grid ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            } gap-6`}
          >
            {filteredObjects.map((obj) => (
              <div
                key={obj.id}
                className="bg-purple-800/20 backdrop-blur-sm border border-purple-600/30 rounded-xl p-6 hover:bg-purple-700/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-full h-48 bg-purple-700/30 rounded-lg mb-4 flex items-center justify-center text-6xl">
                    <img
                      src={obj.thumbnail}
                      alt={obj.title}
                      onError={(e) => {
                        e.target.src = "/fallback.png";
                      }}
                      className="w-24 h-24 object-contain"
                    />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2">
                    {obj.title}
                  </h3>
                  <p className="text-purple-200 text-sm mb-4 line-clamp-2">
                    {obj.description}
                  </p>
                  <p className="text-2xl font-bold text-white mb-4">
                    ${obj.price.toFixed(2)}
                  </p>
                  <button
                    onClick={() => {
                      console.log("Add clicked:", obj);
                      addItem(obj);
                    }} // ✅ working now
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
