import React, { useState } from "react";
import Navbar2 from "../components/Navbar2";
import { motion } from "framer-motion";
import { User, Briefcase, CreditCard } from "lucide-react";

const Profile: React.FC = () => {
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    username: "john_doe",
    password: "",
    age: "28",
    gender: "Male",
    email: "john.doe@example.com",
    nationality: "Indian",
    address: "123, MG Road, Bangalore",
    phone: "+91 9876543210",
    pan: "ABCDE1234F",
    aadhaar: "1234-5678-9012",
    salarySlip: "",
    employmentType: "Salaried",
    company: "TechCorp Pvt Ltd",
    yoe: "4",
    annualIncome: "1200000",
    bankDetails: "HDFC Bank - 1234567890",
    existingLoan: "250000",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert("Profile saved successfully! (mock)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <Navbar2 />

      <div className="max-w-5xl mx-auto p-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl font-bold text-yellow-400 mb-10 text-center drop-shadow-lg"
        >
          👤 Profile Management
        </motion.h1>

        {/* PERSONAL INFORMATION */}
        <SectionCard title="Personal Information" icon={<User size={24} className="text-yellow-400" />}>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" value={profile.firstName} onChange={handleChange} />
            <Input label="Last Name" name="lastName" value={profile.lastName} onChange={handleChange} />
            <Input label="Username" name="username" value={profile.username} onChange={handleChange} />
            <Input label="Password" name="password" type="password" value={profile.password} onChange={handleChange} />
            <Input label="Age" name="age" value={profile.age} onChange={handleChange} />
            <Select label="Gender" name="gender" value={profile.gender} onChange={handleChange} options={["Male", "Female", "Other"]} />
            <Input label="Email" name="email" value={profile.email} onChange={handleChange} />
            <Input label="Nationality" name="nationality" value={profile.nationality} onChange={handleChange} />
            <Input label="Address" name="address" value={profile.address} onChange={handleChange} />
            <Input label="Phone Number" name="phone" value={profile.phone} onChange={handleChange} />
            <Input label="PAN Number" name="pan" value={profile.pan} onChange={handleChange} />
            <Input label="Aadhaar Number" name="aadhaar" value={profile.aadhaar} onChange={handleChange} />
            <FileUpload label="Upload Salary Slip" name="salarySlip" onChange={handleChange} />
          </div>
        </SectionCard>

        {/* EMPLOYMENT DETAILS */}
        <SectionCard title="Employment Details" icon={<Briefcase size={24} className="text-yellow-400" />}>
          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Employment Type"
              name="employmentType"
              value={profile.employmentType}
              onChange={handleChange}
              options={["Salaried", "Self Employed", "Unemployed"]}
            />
            <Input label="Company" name="company" value={profile.company} onChange={handleChange} />
            <Input label="Years of Experience" name="yoe" value={profile.yoe} onChange={handleChange} />
          </div>
        </SectionCard>

        {/* FINANCIAL INFORMATION */}
        <SectionCard title="Financial Information" icon={<CreditCard size={24} className="text-yellow-400" />}>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Annual Income (₹)" name="annualIncome" value={profile.annualIncome} onChange={handleChange} />
            <Input label="Bank Account Details" name="bankDetails" value={profile.bankDetails} onChange={handleChange} />
            <Input label="Existing Loan Amount (if any)" name="existingLoan" value={profile.existingLoan} onChange={handleChange} />
          </div>
        </SectionCard>

        {/* SAVE BUTTON */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="w-full mt-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold rounded-2xl shadow-lg hover:shadow-yellow-500/30 transition-all"
        >
          Save Profile
        </motion.button>
      </div>
    </div>
  );
};

// ✨ Reusable Section Wrapper
const SectionCard: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  children,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-lg mb-8"
  >
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h2 className="text-2xl font-semibold text-yellow-400">{title}</h2>
    </div>
    {children}
  </motion.div>
);

// 🧩 Input Component
const Input: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}> = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-gray-300 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-xl bg-gray-800/70 border border-gray-700 text-white focus:ring-2 focus:ring-yellow-400/40 outline-none transition-all"
    />
  </div>
);

// 🧩 Select Component
const Select: React.FC<{
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ label, name, value, options, onChange }) => (
  <div>
    <label className="block text-gray-300 mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-xl bg-gray-800/70 border border-gray-700 text-white focus:ring-2 focus:ring-yellow-400/40 outline-none transition-all"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

// 🧩 File Upload Component
const FileUpload: React.FC<{
  label: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, onChange }) => (
  <div>
    <label className="block text-gray-300 mb-1">{label}</label>
    <input
      type="file"
      name={name}
      onChange={onChange}
      className="w-full p-2 rounded-xl bg-gray-800/70 border border-gray-700 text-gray-400 focus:ring-2 focus:ring-yellow-400/40 outline-none transition-all"
    />
  </div>
);

export default Profile;
