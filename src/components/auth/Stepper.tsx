import React from 'react';
import { CheckCircleIcon } from '@/assets/icons';

export const Stepper = ({ currentStep, steps }) => (
    <div className="flex items-center justify-center">
        {steps.map((step, index) => (
            <React.Fragment key={index}>
                <div className="flex flex-col items-center text-center w-20">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep > index ? 'bg-blue-600 border-blue-500' : currentStep === index ? 'bg-blue-500 border-blue-400 scale-110' : 'bg-gray-800 border-gray-700'}`}>
                        {currentStep > index ? <CheckCircleIcon /> : step.icon}
                    </div>
                    <p className={`mt-2 text-xs transition ${currentStep >= index ? 'text-white' : 'text-gray-500'}`}>{step.name}</p>
                </div>
                {index < steps.length - 1 && <div className={`flex-1 h-1 rounded-full transition-colors duration-500 ${currentStep > index ? 'bg-blue-600' : 'bg-gray-800'}`}></div>}
            </React.Fragment>
        ))}
    </div>
);