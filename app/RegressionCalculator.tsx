"use client"

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Scatter, ScatterChart, ResponsiveContainer } from 'recharts';

const RegressionCalculator = () => {
  const [originalPoints, setOriginalPoints] = useState([
    { x: 75, y: 1080 },
    { x: 100, y: 1240 },
    { x: 125, y: 1340 },
    { x: 150, y: 1420 }
  ]);

  const [xValue, setXValue] = useState('');
  const [predictedY, setPredictedY] = useState(null);

  const updatePoint = (index: number, field: 'x' | 'y', value: string) => {
    const newPoints = [...originalPoints];
    newPoints[index][field] = parseFloat(value) || 0;
    setOriginalPoints(newPoints);
  };

  const addPoint = () => {
    setOriginalPoints([...originalPoints, { x: 0, y: 0 }]);
  };

  const removePoint = (index: number) => {
    if (originalPoints.length > 3) {
      setOriginalPoints(originalPoints.filter((_, i) => i !== index));
    }
  };

  // Calculate quadratic regression: y = ax² + bx + c
  const calculateQuadraticRegression = () => {
    const n = originalPoints.length;
    let sumX = 0, sumY = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0;
    let sumXY = 0, sumX2Y = 0;

    originalPoints.forEach(point => {
      sumX += point.x;
      sumY += point.y;
      sumX2 += point.x ** 2;
      sumX3 += point.x ** 3;
      sumX4 += point.x ** 4;
      sumXY += point.x * point.y;
      sumX2Y += (point.x ** 2) * point.y;
    });

    // Solve the system of equations using matrices
    const matrix = [
      [sumX4, sumX3, sumX2],
      [sumX3, sumX2, sumX],
      [sumX2, sumX, n]
    ];
    
    const results = [sumX2Y, sumXY, sumY];

    // Gaussian elimination
    for (let i = 0; i < 3; i++) {
      let maxRow = i;
      for (let k = i + 1; k < 3; k++) {
        if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
          maxRow = k;
        }
      }
      [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];
      [results[i], results[maxRow]] = [results[maxRow], results[i]];

      for (let k = i + 1; k < 3; k++) {
        const factor = matrix[k][i] / matrix[i][i];
        results[k] -= factor * results[i];
        for (let j = i; j < 3; j++) {
          matrix[k][j] -= factor * matrix[i][j];
        }
      }
    }

    // Back substitution
    const coeffs = new Array(3);
    for (let i = 2; i >= 0; i--) {
      coeffs[i] = results[i];
      for (let j = i + 1; j < 3; j++) {
        coeffs[i] -= matrix[i][j] * coeffs[j];
      }
      coeffs[i] /= matrix[i][i];
    }

    return { a: coeffs[0], b: coeffs[1], c: coeffs[2] };
  };

  const coeffs = calculateQuadraticRegression();
  const { a, b, c } = coeffs;

  // Generate points for the curve
  const curvePoints = [];
  for (let x = 70; x <= 160; x += 5) {
    const y = a * x * x + b * x + c;
    curvePoints.push({ x, y, predictedY: y });
  }

  // Combined data for chart
  const chartData = curvePoints.map(point => {
    const original = originalPoints.find(p => p.x === point.x);
    return {
      x: point.x,
      predicted: point.y,
      actual: original ? original.y : null
    };
  });

  const handlePredict = () => {
    const x = parseFloat(xValue);
    if (!isNaN(x)) {
      const y = a * x * x + b * x + c;
      setPredictedY(y.toFixed(2));
    }
  };

  // Calculate R² (coefficient of determination)
  const calculateR2 = () => {
    const yMean = originalPoints.reduce((sum, p) => sum + p.y, 0) / originalPoints.length;
    let ssRes = 0;
    let ssTot = 0;
    
    originalPoints.forEach(point => {
      const predicted = a * point.x * point.x + b * point.x + c;
      ssRes += (point.y - predicted) ** 2;
      ssTot += (point.y - yMean) ** 2;
    });
    
    return (1 - ssRes / ssTot);
  };

  const r2 = calculateR2();

  return (
    <div className="bg-gray-300 min-h-screen">
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Launcher Speed Calculator for Robotics</h1>
        <p className="text-gray-700 mb-6">
          Enter points with the X value being the horizontal distance from the target and the Y value being the speed you need to run your motor at to reach the target. Please enter four points. Optimised for FIRST Tech Challenge, Decode season 2025-26.
        </p>
      
        <div className="bg-gray-100 border border-gray-400 rounded p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Your Data Points:</h3>
            <button
              onClick={addPoint}
              className="bg-pink-600 text-white px-3 py-1 rounded text-sm hover:bg-pink-700"
            >
              + Add Point
            </button>
          </div>
          <div className="space-y-2">
            {originalPoints.map((point, index) => (
              <div key={index} className="flex gap-3 items-center">
                <span className="text-sm w-8">({index + 1})</span>
                <input
                  type="number"
                  value={point.x}
                  onChange={(e) => updatePoint(index, 'x', e.target.value)}
                  className="border rounded px-3 py-1 w-24"
                  placeholder="x"
                />
                <input
                  type="number"
                  value={point.y}
                  onChange={(e) => updatePoint(index, 'y', e.target.value)}
                  className="border rounded px-3 py-1 w-24"
                  placeholder="y"
                />
                {originalPoints.length > 3 && (
                  <button
                    onClick={() => removePoint(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-pink-50 border border-pink-300 rounded p-4 mb-6">
          <h2 className="font-semibold text-lg mb-2">Best-Fit Quadratic Equation:</h2>
          <p className="text-xl font-mono mb-2">
            y = {a.toFixed(4)}x² + {b.toFixed(4)}x + {c.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">R² = {r2.toFixed(4)} (goodness of fit)</p>
        </div>

        <div className="bg-gray-100 border border-gray-400 rounded p-4 mb-6">
          <h3 className="font-semibold mb-2">Verification with your original points:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {originalPoints.map(point => {
              const predicted = a * point.x * point.x + b * point.x + c;
              const error = Math.abs(point.y - predicted);
              return (
                <div key={point.x} className="bg-gray-50 p-2 rounded">
                  <span className="font-mono">x={point.x}: </span>
                  <span>Actual={point.y}, Predicted={predicted.toFixed(1)}</span>
                  <span className="text-gray-500"> (error: {error.toFixed(1)})</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-100 border border-gray-400 rounded p-4 mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" label={{ value: 'X', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Y', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="predicted" stroke="#ec4899" name="Predicted (quadratic)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="actual" stroke="#ef4444" name="Actual data" strokeWidth={0} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-pink-50 border border-pink-300 rounded p-4">
          <h3 className="font-semibold mb-3">Predict Y for any X value:</h3>
          <div className="flex gap-3 items-center">
            <input
              type="number"
              value={xValue}
              onChange={(e) => setXValue(e.target.value)}
              placeholder="Enter x value"
              className="border rounded px-3 py-2 w-40"
            />
            <button
              onClick={handlePredict}
              className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
            >
              Calculate Y
            </button>
            {predictedY && (
              <span className="text-lg font-semibold">
                y ≈ {predictedY}
              </span>
            )}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-600">
          <p>Created and shared by FTC Team 11505 The Flaming Galahs | Get in touch with us by email at S.Canfield@stpeters.qld.edu.au</p>
        </div>
      </div>
    </div>  
  );
};

export default RegressionCalculator;