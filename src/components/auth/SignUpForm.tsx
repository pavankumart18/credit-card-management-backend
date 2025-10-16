import React, { useState } from 'react';
import { VALIDATION_RULES, formatAadhaar, getPasswordStrength } from '../../utils/validation';
import { Stepper } from './Stepper';
import { Input, PasswordField } from './common/Input';
import { Select } from './common/Select';
import { FileUpload } from './common/FileUpload';
import { UserIcon, BriefcaseIcon, DollarSignIcon, UploadCloudIcon, CheckCircleIcon } from '../../assets/icons';

// Step-specific components can live inside the main form file for cohesion
const PersonalInfoStep = ({ formData, errors, handleChange, handlePasswordChange, handlePasswordVisibility }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <Input id="firstName" label="First Name" value={formData.firstName} onChange={handleChange} error={errors.firstName} />
        <Input id="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} error={errors.lastName} />
        <Input id="email" label="Email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
        <Input id="phone" label="Phone Number" type="tel" value={formData.phone} onChange={handleChange} error={errors.phone} />
        <div className="md:col-span-2">
            <PasswordField id="password" label="Password" value={formData.password.value} visible={formData.password.visible} strength={formData.password.strength} onChange={handlePasswordChange} onVisibilityChange={handlePasswordVisibility} error={errors.password} />
        </div>
        <Input id="pan" label="PAN Number" value={formData.pan} onChange={(e) => handleChange({ target: { id: 'pan', value: e.target.value.toUpperCase() } })} error={errors.pan} maxLength={10} />
        <Input id="aadhaar" label="Aadhaar Number" value={formData.aadhaar} onChange={handleChange} error={errors.aadhaar} maxLength={14} />
    </div>
);

const EmploymentStep = ({ formData, errors, handleChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 min-h-[150px]">
        <div className="md:col-span-2"><Select id="employmentType" label="Employment Type" value={formData.employmentType} onChange={handleChange} error={errors.employmentType}><option value="">Select...</option><option>Salaried</option><option>Self-employed</option><option>Unemployed</option></Select></div>
        {formData.employmentType === 'Salaried' && <>
            <Input id="company" label="Company Name" value={formData.company} onChange={handleChange} error={errors.company} />
            <Input id="yearsOfExperience" label="Years of Experience" type="number" value={formData.yearsOfExperience} onChange={handleChange} error={errors.yearsOfExperience} />
        </>}
    </div>
);

const FinancialStep = ({ formData, errors, handleChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <Input id="annualIncome" label="Annual Income (INR)" type="number" value={formData.annualIncome} onChange={handleChange} error={errors.annualIncome} />
        <div className="md:col-span-2"><Input id="existingLoanAmount" label="Existing Loan Amount (Optional)" type="number" value={formData.existingLoanAmount} onChange={handleChange} /></div>
    </div>
);

const DocumentsStep = ({ formData, handleFileChange, errors }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 min-h-[150px]">
        {formData.employmentType === 'Salaried' && <FileUpload id="salarySlips" label="Latest Salary Slips" file={formData.salarySlips} onChange={handleFileChange} error={errors.salarySlips} />}
        <FileUpload id="photoId" label="PAN/Aadhaar Card Copy" file={formData.photoId} onChange={handleFileChange} error={errors.photoId} />
    </div>
);

const ReviewStep = ({ formData }) => (
    <div className="space-y-3 bg-black/20 p-6 rounded-lg border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Review Your Details</h3>
        {Object.entries(formData).map(([key, value]) => {
            if (key === 'password' || !value) return null;
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            const displayValue = value instanceof File ? value.name : String(value);

            return <div key={key} className="flex justify-between items-center border-b border-gray-800 py-2"><p className="text-gray-400 text-sm">{formattedKey}:</p> <p className="font-medium text-right text-sm">{displayValue}</p></div>;
        })}
    </div>
);

const SuccessStep = () => (
    <div className="text-center py-10 flex flex-col items-center">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircleIcon className="w-16 h-16 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold mt-6">Application Submitted!</h2>
        <p className="text-gray-400 mt-2 max-w-sm">We are reviewing your application and will get back to you within 2-3 business days.</p>
    </div>
);

export const SignUpForm = ({ setView }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', password: { value: '', visible: false, strength: 0 }, email: '',
        phone: '', pan: '', aadhaar: '', age: '',
        employmentType: '', company: '', yearsOfExperience: '',
        annualIncome: '',
        salarySlips: null as File | null, photoId: null as File | null,
    });
    const [errors, setErrors] = useState<any>({});
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    const steps = [ { name: 'Personal', icon: <UserIcon /> }, { name: 'Employment', icon: <BriefcaseIcon /> }, { name: 'Financial', icon: <DollarSignIcon /> }, { name: 'Documents', icon: <UploadCloudIcon /> }, { name: 'Review', icon: <CheckCircleIcon /> } ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: id === 'aadhaar' ? formatAadhaar(value) : value }));
        if (errors[id]) setErrors(prev => ({ ...prev, [id]: undefined }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, password: { ...prev.password, value, strength: getPasswordStrength(value) } }));
        if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
    };

    const handlePasswordVisibility = () => setFormData(prev => ({ ...prev, password: { ...prev.password, visible: !prev.password.visible }}));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, files } = e.target;
        if (files) {
            setFormData(prev => ({ ...prev, [id]: files[0] || null }));
            if (errors[id]) setErrors(prev => ({ ...prev, [id]: undefined }));
        }
    };

    const validateStep = (): boolean => {
        const newErrors: any = {};
        if (currentStep === 0) {
            if (!formData.firstName) newErrors.firstName = 'First name is required.';
            if (!formData.lastName) newErrors.lastName = 'Last name is required.';
            if (formData.password.value.length < 8) newErrors.password = 'Password must be at least 8 characters.';
            if (!VALIDATION_RULES.email.test(formData.email)) newErrors.email = 'Please enter a valid email address.';
            if (!VALIDATION_RULES.phone.test(formData.phone)) newErrors.phone = 'Please enter a valid 10-digit phone number.';
            if (!VALIDATION_RULES.pan.test(formData.pan.toUpperCase())) newErrors.pan = 'Please enter a valid PAN number.';
            if (!VALIDATION_RULES.aadhaar.test(formData.aadhaar)) newErrors.aadhaar = 'Please enter a valid Aadhaar number.';
        } else if (currentStep === 1) {
            if (!formData.employmentType) newErrors.employmentType = 'Please select your employment type.';
            if (formData.employmentType === 'Salaried' && !formData.company) newErrors.company = 'Company name is required.';
        } else if (currentStep === 2) {
            if (!formData.annualIncome || +formData.annualIncome <= 0) newErrors.annualIncome = 'Please enter a valid annual income.';
        } else if (currentStep === 3) {
            if (formData.employmentType === 'Salaried' && !formData.salarySlips) newErrors.salarySlips = 'Salary slip is required.';
            if (!formData.photoId) newErrors.photoId = 'A copy of your PAN or Aadhaar card is required.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const changeStep = (nextStep: number) => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            setCurrentStep(nextStep);
            setIsAnimatingOut(false);
        }, 300);
    };

    const handleNext = () => validateStep() && changeStep(currentStep + 1);
    const handleBack = () => changeStep(currentStep - 1);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep()) {
            console.log("Form Submitted:", formData);
            changeStep(currentStep + 1);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent">
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl p-6 md:p-10 shadow-2xl shadow-black/40">
                {currentStep < 5 && (
                    <>
                        <h1 className="text-4xl font-bold text-center mb-2 text-white">Join Creda</h1>
                        <p className="text-center text-gray-400 mb-10">The future of credit card management starts here.</p>
                        <Stepper currentStep={currentStep} steps={steps} />
                    </>
                )}

                <form onSubmit={handleSubmit} className="mt-8">
                     <div className={`transition-all duration-300 ${isAnimatingOut ? 'opacity-0' : 'opacity-100'}`}>
                        {currentStep === 0 && <PersonalInfoStep {...{formData, errors, handleChange, handlePasswordChange, handlePasswordVisibility}} />}
                        {currentStep === 1 && <EmploymentStep {...{formData, errors, handleChange}} />}
                        {currentStep === 2 && <FinancialStep {...{formData, errors, handleChange}} />}
                        {currentStep === 3 && <DocumentsStep {...{formData, handleFileChange, errors}} />}
                        {currentStep === 4 && <ReviewStep {...{formData}} />}
                        {currentStep === 5 && <SuccessStep />}
                    </div>

                    {currentStep < 5 && (
                        <div className="flex justify-between mt-10">
                            <button type="button" onClick={handleBack} disabled={currentStep === 0} className="px-6 py-3 rounded-lg font-semibold bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition">Back</button>
                            <button type={currentStep === 4 ? "submit" : "button"} onClick={currentStep < 4 ? handleNext : undefined} className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition-transform shadow-lg shadow-blue-600/30">
                                {currentStep === 4 ? 'Submit Application' : 'Next Step'}
                            </button>
                        </div>
                    )}
                </form>
                 {currentStep < 5 && (
                     <p className="text-center text-sm text-gray-400 mt-8">
                        Already have an account?{' '}
                        <button onClick={() => setView('login')} className="font-medium text-blue-400 hover:underline">Sign In</button>
                    </p>
                )}
            </div>
        </div>
    );
};