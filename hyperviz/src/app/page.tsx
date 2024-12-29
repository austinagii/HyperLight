'use client';
import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";

import { FCNN } from "@/lib/fcnn";
import { Renderer } from "@/lib/renderer";

export default function Home() {
  const [architecture, setArchitecture] = useState<number[]>([3, 5, 1]);
  const [newLayerSize, setNewLayerSize] = useState<number>(1);
  const fcnnRef = useRef<FCNN | null>(null);
  const rendererRef = useRef<Renderer | null>(null);

  // Create and render a new FCNN instance each time the architecture changes.
  useEffect(() => {
    console.log("Architecture changed:", architecture);
    
    const canvas = d3.select<SVGSVGElement, unknown>("svg#network-svg");
    
    // Store instances in refs
    fcnnRef.current = new FCNN(architecture);
    rendererRef.current = new Renderer(canvas, fcnnRef.current);
    rendererRef.current.render();
  }, [architecture]);

  // Add handler for animation button
  const handleAnimate = () => {
    if (fcnnRef.current && rendererRef.current) {
      rendererRef.current.animateLinks();
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Architecture Builder */}
      <div className="border rounded p-4 bg-white shadow">
        <h2 className="text-lg font-bold mb-4">Network Architecture</h2>
        
        {/* Display current layers */}
        <div className="flex flex-wrap gap-2 mb-4">
          {architecture.map((size, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="px-3 py-1 bg-blue-100 rounded">
                {size} neurons
              </div>
              {index < architecture.length - 1 && <span>→</span>}
              {architecture.length > 2 && (
                <button
                  onClick={() => {
                    const newLayers = [...architecture];
                    newLayers.splice(index, 1);
                    setArchitecture(newLayers);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="number"
            min="1"
            value={newLayerSize}
            onChange={(e) => setNewLayerSize(parseInt(e.target.value) || 1)}
            className="w-20 px-2 py-1 border rounded"
          />
          <button
            onClick={() => {
              const newLayers = [...architecture, newLayerSize];
              setArchitecture(newLayers);
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Layer
          </button>
          <button
            onClick={() => {
              const newLayers = [...architecture.slice(0, -1), newLayerSize];
              setArchitecture(newLayers);
            }}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Update Last Layer
          </button>
        </div>
      </div>

      {/* Add the SVG container */}
      <div className="border rounded p-4 bg-white shadow">
        <div className="mb-4">
          <button
            onClick={handleAnimate}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Animate Network
          </button>
        </div>
        <svg 
          id="network-svg"
          width="800"
          height="600"
          className="w-full h-full"
        ></svg>
      </div>
    </div>
  );
}