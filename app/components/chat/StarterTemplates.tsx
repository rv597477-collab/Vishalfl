import React from 'react';
import type { Template } from '~/types/template';
import { STARTER_TEMPLATES } from '~/utils/constants';

interface FrameworkLinkProps {
  template: Template;
}

const FrameworkLink: React.FC<FrameworkLinkProps> = ({ template }) => (
  <a
    href={`/git?url=https://github.com/${template.githubRepo}.git`}
    data-state="closed"
    data-discover="true"
    className="group relative"
  >
    <div
      className={`inline-block ${template.icon} w-9 h-9 text-4xl text-bolt-elements-textTertiary transition-all duration-300 group-hover:text-blue-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]`}
      title={template.label}
    />
  </a>
);

const StarterTemplates: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-5 animate-fade-in animation-delay-400">
      <span className="text-sm text-bolt-elements-textTertiary">or start a blank app with your favorite stack</span>
      <div className="flex justify-center">
        <div className="flex flex-wrap justify-center items-center gap-5 max-w-md px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] backdrop-blur-sm">
          {STARTER_TEMPLATES.map((template) => (
            <FrameworkLink key={template.name} template={template} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StarterTemplates;
