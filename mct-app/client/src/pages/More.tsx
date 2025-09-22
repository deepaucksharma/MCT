
import { useState } from 'react';
import {
  AcademicCapIcon,
  PlayIcon,
  BookOpenIcon,
  BeakerIcon,
  MicrophoneIcon,
  LinkIcon,
  ChevronRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { getProfessionalResources, mctResources } from '../data/mctResources';

interface ResourceSectionProps {
  title: string;
  description: string;
  resources: any[];
  icon: React.ElementType;
}

function ResourceSection({ title, description, resources, icon: Icon }: ResourceSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary-600" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <ChevronRightIcon
          className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 px-4 py-3 space-y-2">
          {resources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded hover:bg-gray-50 group"
            >
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700 group-hover:text-primary-600">
                  {resource.title}
                </span>
              </div>
              {resource.duration && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <ClockIcon className="h-3 w-3" />
                  {resource.duration}
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function More() {
  const professionalResources = getProfessionalResources();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Resources & References</h1>
        <p className="text-gray-600">
          Curated learning materials, clinical references, and professional resources for MCT
        </p>
      </div>

      <div className="space-y-4">
        {/* Core MCT Resources */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Core MCT Learning</h2>
          <div className="space-y-3">
            <ResourceSection
              title="MCT Fundamentals"
              description="Introduction to Metacognitive Therapy principles"
              resources={mctResources.orientation.mctOverview}
              icon={AcademicCapIcon}
            />
            <ResourceSection
              title="Clinical Model & Theory"
              description="S-REF model, CAS, and metacognitive beliefs"
              resources={mctResources.clinicalModel.srefModel}
              icon={BookOpenIcon}
            />
            <ResourceSection
              title="Clinical Demonstrations"
              description="Full MCT session examples and practice demos"
              resources={mctResources.clinicalModel.clinicalDemos}
              icon={PlayIcon}
            />
          </div>
        </div>

        {/* Practice Resources */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Practice & Techniques</h2>
          <div className="space-y-3">
            <ResourceSection
              title="ATT Resources"
              description="Guided Attention Training Technique sessions"
              resources={mctResources.attResources.guidedSessions}
              icon={PlayIcon}
            />
            <ResourceSection
              title="Detached Mindfulness"
              description="DM practice guides and micro-exercises"
              resources={mctResources.dmResources.practice}
              icon={PlayIcon}
            />
            <ResourceSection
              title="Behavioral Experiments"
              description="Experiment design and implementation guides"
              resources={mctResources.experiments}
              icon={BeakerIcon}
            />
          </div>
        </div>

        {/* Professional Resources */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Professional Development</h2>
          <div className="space-y-3">
            {professionalResources.map((category, index) => (
              <ResourceSection
                key={index}
                title={category.title}
                description={category.description}
                resources={category.resources}
                icon={category.title.includes('Podcast') ? MicrophoneIcon : AcademicCapIcon}
              />
            ))}
          </div>
        </div>

        {/* Digital Therapeutics */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Digital Therapeutics</h2>
          <div className="space-y-3">
            <ResourceSection
              title="DTx Introduction"
              description="Understanding digital therapeutics in mental health"
              resources={mctResources.orientation.dtxIntroduction}
              icon={LinkIcon}
            />
            <ResourceSection
              title="Measurement & Outcomes"
              description="Clinical dashboards and outcome tracking"
              resources={mctResources.measurement}
              icon={BookOpenIcon}
            />
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> These resources supplement your MCT journey. Focus on the process of thinking,
          not the content. All materials emphasize HOW you relate to thoughts, not WHAT you think about.
        </p>
      </div>
    </div>
  );
}