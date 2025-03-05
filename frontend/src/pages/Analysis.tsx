import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface PerformanceMetrics {
  win_rate: number;
  profit_factor: number;
  average_win: number;
  average_loss: number;
  best_conditions: string[];
  pattern_insights: string[];
}

interface PatternAnalysis {
  important_factors: Array<{
    factor: string;
    importance: number;
  }>;
  success_patterns: string[];
}

const Analysis: React.FC = () => {
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [patterns, setPatterns] = useState<PatternAnalysis | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const [performanceRes, patternsRes] = await Promise.all([
        axios.get('http://localhost:8000/analysis/performance'),
        axios.get('http://localhost:8000/analysis/patterns')
      ]);
      setPerformance(performanceRes.data);
      setPatterns(patternsRes.data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  const winRateData = {
    labels: ['Wins', 'Losses'],
    datasets: [
      {
        data: performance ? [performance.win_rate * 100, (1 - performance.win_rate) * 100] : [0, 0],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#059669', '#DC2626'],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trading Analysis</h1>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Win Rate</h3>
          <div className="h-48">
            <Pie data={winRateData} options={{ maintainAspectRatio: false }} />
          </div>
          <p className="text-center mt-4 text-lg font-medium">
            {performance ? `${(performance.win_rate * 100).toFixed(1)}%` : 'Loading...'}
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Key Metrics</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-gray-500">Profit Factor</dt>
              <dd className="text-2xl font-medium">
                {performance?.profit_factor.toFixed(2) || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Average Win</dt>
              <dd className="text-2xl font-medium text-green-600">
                ${performance?.average_win.toFixed(2) || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Average Loss</dt>
              <dd className="text-2xl font-medium text-red-600">
                ${performance?.average_loss.toFixed(2) || '-'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Best Market Conditions</h3>
          <ul className="space-y-2">
            {performance?.best_conditions.map((condition, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="text-green-500">•</span>
                <span>{condition}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pattern Recognition */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Pattern Recognition</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Important Factors</h3>
            <div className="space-y-3">
              {patterns?.important_factors.map((factor, index) => (
                <div key={index} className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                        {factor.factor}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        {(factor.importance * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                    <div
                      style={{ width: `${factor.importance * 100}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Success Patterns</h3>
            <ul className="space-y-2">
              {patterns?.success_patterns.map((pattern, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span className="text-gray-700">{pattern}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Pattern Insights */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
        <div className="space-y-4">
          {performance?.pattern_insights.map((insight, index) => (
            <div
              key={index}
              className="p-4 border border-indigo-100 rounded-lg bg-indigo-50"
            >
              <p className="text-indigo-700">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analysis;