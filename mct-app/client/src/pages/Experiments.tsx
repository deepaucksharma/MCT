
import { useState } from 'react';
import {
  BeakerIcon,
  BookOpenIcon,
  PlayCircleIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentCheckIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { mctResources } from '../data/mctResources';

export default function Experiments() {
  const [expandedResource, setExpandedResource] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <BeakerIcon className="h-7 w-7 text-purple-600" />
          Behavioral Experiments
        </h1>
        <p className="text-gray-600">
          Test your metacognitive beliefs through structured experiments. Challenge assumptions about thinking.
        </p>
      </div>

      {/* Introduction Section */}
      <div className="bg-purple-50 rounded-lg p-6 mb-6 border border-purple-200">
        <h2 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
          <LightBulbIcon className="h-5 w-5" />
          What are Behavioral Experiments?
        </h2>
        <p className="text-purple-800 text-sm mb-4">
          Behavioral experiments in MCT are structured tests of your beliefs about thinking. Unlike traditional
          approaches, we're not testing whether your worries are realistic - we're testing your beliefs about
          the process of thinking itself.
        </p>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <ClipboardDocumentCheckIcon className="h-4 w-4 text-purple-600 mt-0.5" />
            <p className="text-sm text-purple-700">
              <strong>Uncontrollability:</strong> "I can't stop worrying once I start"
            </p>
          </div>
          <div className="flex items-start gap-2">
            <ClipboardDocumentCheckIcon className="h-4 w-4 text-purple-600 mt-0.5" />
            <p className="text-sm text-purple-700">
              <strong>Danger:</strong> "Worrying will make me go crazy"
            </p>
          </div>
          <div className="flex items-start gap-2">
            <ClipboardDocumentCheckIcon className="h-4 w-4 text-purple-600 mt-0.5" />
            <p className="text-sm text-purple-700">
              <strong>Positive beliefs:</strong> "Worrying helps me prepare"
            </p>
          </div>
        </div>
      </div>

      {/* Experiment Resources */}
      <div className="mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpenIcon className="h-5 w-5 text-blue-600" />
          Experiment Design Resources
        </h2>
        <div className="space-y-3">
          {mctResources.experiments.map((resource, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setExpandedResource(expandedResource === index ? null : index)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <PlayCircleIcon className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{resource.title}</h3>
                    {resource.duration && (
                      <p className="text-sm text-gray-500">Duration: {resource.duration}</p>
                    )}
                  </div>
                </div>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                >
                  <span className="text-sm">Open</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </a>
              </button>
              {expandedResource === index && (
                <div className="px-4 pb-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mt-3">
                    This resource provides guidance on designing and implementing behavioral experiments
                    to test metacognitive beliefs. Focus on process, not content.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Experiment Templates (Placeholder) */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-3">Experiment Templates</h2>
        <p className="text-gray-600 text-sm mb-4">
          Interactive experiment builders and tracking features coming soon. For now, use the resources
          above to design your experiments manually.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 opacity-60">
            <h3 className="font-medium text-gray-700 mb-2">Worry Postponement Test</h3>
            <p className="text-sm text-gray-500">Test if you can delay worry to a specific time</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 opacity-60">
            <h3 className="font-medium text-gray-700 mb-2">Attention Control Challenge</h3>
            <p className="text-sm text-gray-500">Test if you can shift attention at will</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 opacity-60">
            <h3 className="font-medium text-gray-700 mb-2">Rumination Duration Test</h3>
            <p className="text-sm text-gray-500">Test what happens if you ruminate for exactly 2 minutes</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 opacity-60">
            <h3 className="font-medium text-gray-700 mb-2">Problem-Solving Without Worry</h3>
            <p className="text-sm text-gray-500">Test if you can solve problems without extended worry</p>
          </div>
        </div>
      </div>

      {/* Key Principles */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Remember:</strong> Experiments in MCT are about discovering how your mind works,
          not about getting the "right" result. Every outcome provides valuable information about
          the process of thinking.
        </p>
      </div>
    </div>
  );
}