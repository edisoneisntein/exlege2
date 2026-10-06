import React from 'react';
import type { ReportSubStep } from '../types';
import { useNavigationContext } from '../context/AnalysisContext';
import { Check } from 'lucide-react';

const Step: React.FC<{ label: string; stepNumber: number; isActive: boolean; isCompleted: boolean }> = ({ label, stepNumber, isActive, isCompleted }) => {
    const circleClasses = isCompleted
      ? 'bg-gradient-to-br from-[#d4af37] via-[#9e7d3b] to-[#594017] text-slate-950 shadow-[0_0_15px_rgba(212,175,55,0.4)] border border-[#FFE898]'
      : isActive
      ? 'border-2 border-[#FFE898] bg-[#3b1c54] text-[#f5d76e] shadow-[0_0_20px_rgba(212,175,55,0.35)] ring-2 ring-[#d4af37]/40 animate-pulse'
      : 'border border-[#3d1e56] bg-[#12071d] text-slate-500';
    
    const textClasses = isCompleted || isActive ? 'text-amber-100 font-cinzel font-bold' : 'text-slate-500 font-cinzel';

    return (
        <div className={`flex flex-col sm:flex-row items-center transition-colors duration-300 ${textClasses}`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 transition-all ${circleClasses}`}>
             {isCompleted ? <Check className="w-4 h-4 text-slate-950 stroke-[3]" /> : stepNumber}
          </div>
          <span className="ml-0 sm:ml-3 mt-2 sm:mt-0 text-xs text-center tracking-wide" dangerouslySetInnerHTML={{ __html: label }}></span>
        </div>
    );
};

const StepIndicator: React.FC = () => {
  const { currentScreen, reportSubStep } = useNavigationContext();
  const steps = ['upload', 'analyzing', 'report'];
  const currentStepIndex = steps.indexOf(currentScreen);
  
  if (currentStepIndex === -1) return null;

  const reportSubStepLabels: Record<ReportSubStep, string> = {
    review: 'Tribunal (1/5)<br/>Revisión Forense',
    governance: 'Tribunal<br/>Gobernanza',
    lab: 'Tribunal<br/>Laboratorio',
    draft: 'Tribunal (2/5)<br/>Borrador Inicial',
    stress_test: 'Tribunal (3/5)<br/>Stress Test',
    refine: 'Tribunal (4/5)<br/>Refinamiento',
  };

  const Connector: React.FC<{ isCompleted: boolean }> = ({ isCompleted }) => (
      <div className="flex-grow h-0.5 mx-2 sm:mx-4 relative overflow-hidden">
        <div className={`w-full h-full rounded-full ${isCompleted ? 'bg-gradient-to-r from-[#d4af37] via-[#f5d76e] to-[#a37b2e] shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'bg-[#29133a]'}`} />
      </div>
  );

  return (
    <div className="mb-6 p-4 sm:p-5 bg-[#12071d]/90 backdrop-blur-2xl rounded-2xl border border-[#C5A059]/40 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.1)] relative overflow-hidden">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898] to-transparent pointer-events-none" />
      <div className="flex items-center justify-between">
        <Step 
            label="Carga & Blindaje" 
            stepNumber={1} 
            isActive={currentStepIndex === 0}
            isCompleted={currentStepIndex > 0} 
        />
        <Connector isCompleted={currentStepIndex > 0} />
        <Step 
            label="Autopsia Cognitiva" 
            stepNumber={2} 
            isActive={currentStepIndex === 1}
            isCompleted={currentStepIndex > 1} 
        />
        <Connector isCompleted={currentStepIndex > 1} />
        <Step 
            label={currentStepIndex === 2 ? reportSubStepLabels[reportSubStep] : 'Estrategia Forense'}
            stepNumber={3} 
            isActive={currentStepIndex === 2}
            isCompleted={currentStepIndex > 2} 
        />
      </div>
    </div>
  );
};

export default StepIndicator;
