import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Search,
  HeartHandshake,
  ShieldCheck,
  Activity,
  AlertCircle,
  Building2,
} from "lucide-react";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import { GENDER_OPTIONS } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { INDIA_STATES_AND_CITIES, INDIAN_STATES_LIST } from "../../constants/indiaLocations";

export default function RecipientRegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    state: "",
    location: "",
    accountType: "individual", // 'individual' or 'hospital_rep'
    hospitalName: "",
    hospitalAddress: "",
    hospitalContactPhone: "",
    representativeDesignation: "",
    authorizationNotes: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverNotice, setServerNotice] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
    } else if (id === "state") {
      setFormData((prev) => ({
        ...prev,
        state: value,
        location: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }

    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
    if (serverNotice) setServerNotice("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    const cleanPhone = formData.phone.trim();
    if (!cleanPhone) {
      newErrors.phone = "10-digit mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number (starts with 6-9)";
    }

    if (!formData.state) newErrors.state = "State / UT selection is required";
    if (!formData.location) newErrors.location = "City selection is required";

    if (formData.accountType === "hospital_rep") {
      if (!formData.hospitalName.trim()) {
        newErrors.hospitalName = "Hospital / Clinic name is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setServerNotice("");
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        gender: formData.gender,
        state: formData.state,
        city: formData.location,
        accountType: formData.accountType,
      };

      if (formData.accountType === "hospital_rep") {
        payload.hospitalName = formData.hospitalName.trim();
        payload.hospitalAddress = formData.hospitalAddress.trim();
        payload.hospitalContactPhone = formData.hospitalContactPhone.trim();
        payload.representativeDesignation = formData.representativeDesignation.trim();
        payload.authorizationNotes = formData.authorizationNotes.trim();
      }

      const res = await authService.registerRecipient(payload);

      if (res && res.user) {
        login(res.user);
        navigate("/recipient");
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Recipient Registration Error:", err);
      setServerNotice(err.message || "Failed to complete recipient registration.");
    } finally {
      setIsLoading(false);
    }
  };

  const cityOptions = formData.state && INDIA_STATES_AND_CITIES[formData.state]
    ? INDIA_STATES_AND_CITIES[formData.state]
    : [];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

        {/* LEFT BRAND PANEL (LIGHT-FIRST HEALTHCARE IDENTITY) */}
        <div className="lg:col-span-5 bg-[#F8FAFC] text-[#1E293B] p-8 sm:p-10 rounded-2xl border border-[#E2E8F0] flex flex-col justify-between shadow-xs">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F0F7FF] border border-[#BFDBFE] text-[#315B83] text-xs font-semibold tracking-wide uppercase">
                <Building2 className="w-3.5 h-3.5" />
                <span>HOSPITAL & RECIPIENT REQUISITION</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B] tracking-tight">
                Emergency Blood Coordination Portal.
              </h1>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-normal">
                Register as a hospital coordinator or patient recipient. Discover compatible voluntary donors across distance presets [5..50 KM] and broadcast verified emergency requisitions in real time.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#E2E8F0]">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E2E8F0]">
                <div className="p-2 rounded-lg bg-[#F0F7FF] border border-[#BFDBFE] text-[#315B83] shrink-0 mt-0.5">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1E293B]">Dynamic Radius Matching</h4>
                  <p className="text-[11px] text-[#475569] mt-0.5">Preset horizons: 5, 10, 20, 30, 50 KM with Haversine spherical precision.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E2E8F0]">
                <div className="p-2 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#A61B2B] shrink-0 mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1E293B]">Real-Time Socket Broadcast</h4>
                  <p className="text-[11px] text-[#475569] mt-0.5">Instantly dispatch high-priority notifications to matching donors without page refresh.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E2E8F0]">
                <div className="p-2 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#28734A] shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1E293B]">Shielded Contact Coordination</h4>
                  <p className="text-[11px] text-[#475569] mt-0.5">Donor contact details unlock securely the instant a voluntary donor accepts your request.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-8 border-t border-[#E2E8F0] text-[11px] text-[#64748B] flex items-center justify-between">
            <span>CLINICAL PROTOCOL</span>
            <span className="text-[#315B83] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#315B83] animate-pulse" /> VERIFIED REQUISITIONS
            </span>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl border border-[#E2E8F0] flex flex-col justify-between transition-colors shadow-xs">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#1E293B] tracking-tight">
                Create Recipient / Hospital Account
              </h2>
              <p className="text-xs text-[#475569] mt-1">
                Register to search compatible voluntary donors and broadcast emergency blood requisitions.
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="bg-[#F8FAFC] p-1 rounded-lg flex items-center gap-1 border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => navigate("/register/donor")}
                className="flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 text-[#475569] hover:text-[#1E293B] cursor-pointer"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                Donor Registry
              </button>

              <button
                type="button"
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 bg-[#315B83] text-white cursor-default shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                Recipient Portal
              </button>
            </div>

            {/* Account Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1E293B] uppercase tracking-wider">
                Account Type Designation
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, accountType: "individual" }))}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    formData.accountType === "individual"
                      ? "border-[#315B83] bg-[#F0F7FF] ring-1 ring-[#315B83]"
                      : "border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className={`w-4 h-4 ${formData.accountType === "individual" ? "text-[#315B83]" : "text-[#64748B]"}`} />
                    <span className="text-xs font-bold text-[#1E293B]">Individual / Family</span>
                  </div>
                  <p className="text-[11px] text-[#475569]">
                    Personal blood requisition. Immediate access upon registration.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, accountType: "hospital_rep" }))}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    formData.accountType === "hospital_rep"
                      ? "border-[#315B83] bg-[#F0F7FF] ring-1 ring-[#315B83]"
                      : "border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className={`w-4 h-4 ${formData.accountType === "hospital_rep" ? "text-[#315B83]" : "text-[#64748B]"}`} />
                    <span className="text-xs font-bold text-[#1E293B]">Hospital / Clinic Coordinator</span>
                  </div>
                  <p className="text-[11px] text-[#475569]">
                    Institutional coordinator. Requires administrative verification.
                  </p>
                </button>
              </div>
            </div>

            {serverNotice && (
              <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#A61B2B] shrink-0 mt-0.5" />
                <p>{serverNotice}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  id="fullName"
                  placeholder="Priya Verma"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  icon={User}
                  required
                />

                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  placeholder="priya.verma@example.in"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  icon={Mail}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  icon={Lock}
                  required
                />

                <Input
                  label="Confirm Password"
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  icon={Lock}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Mobile Number"
                  id="phone"
                  type="tel"
                  prefix="+91"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  icon={Phone}
                  required
                />

                <Select
                  label="Gender"
                  id="gender"
                  options={GENDER_OPTIONS}
                  value={formData.gender}
                  onChange={handleChange}
                  error={errors.gender}
                  placeholder="Select Gender"
                  icon={User}
                />
              </div>

              {/* Dependent State & City Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="State / Union Territory"
                  id="state"
                  options={INDIAN_STATES_LIST}
                  value={formData.state}
                  onChange={handleChange}
                  error={errors.state}
                  placeholder="Select State / UT"
                  icon={MapPin}
                  required
                />

                <Select
                  label="City"
                  id="location"
                  options={cityOptions}
                  value={formData.location}
                  onChange={handleChange}
                  error={errors.location}
                  placeholder={formData.state ? "Select City" : "Select State First"}
                  disabled={!formData.state}
                  icon={MapPin}
                  required
                />
              </div>

              {/* Conditional Hospital Information */}
              {formData.accountType === "hospital_rep" && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 space-y-3.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <Building2 className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Hospital / Institutional Details
                    </h3>
                  </div>

                  <Input
                    label="Hospital / Clinic Name"
                    id="hospitalName"
                    placeholder="e.g. AIIMS New Delhi / Fortis Memorial"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    error={errors.hospitalName}
                    icon={Building2}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Your Designation / Role"
                      id="representativeDesignation"
                      placeholder="e.g. Blood Bank Officer / Medical Officer"
                      value={formData.representativeDesignation}
                      onChange={handleChange}
                      icon={User}
                    />

                    <Input
                      label="Hospital Contact / Desk Phone"
                      id="hospitalContactPhone"
                      placeholder="e.g. 011-26588500"
                      value={formData.hospitalContactPhone}
                      onChange={handleChange}
                      icon={Phone}
                    />
                  </div>

                  <Input
                    label="Hospital Address / Facility Unit"
                    id="hospitalAddress"
                    placeholder="e.g. Ansari Nagar East, New Delhi"
                    value={formData.hospitalAddress}
                    onChange={handleChange}
                    icon={MapPin}
                  />

                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Institutional Verification Notice</p>
                      <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                        Hospital representative registrations are submitted for platform verification. Any blood requests created while in <em>Pending Verification</em> status are held from donor matching and dispatch until approved by administrators.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="secondary"
                className="w-full py-2.5 mt-4 font-bold"
                isLoading={isLoading}
              >
                Complete Recipient Registration
              </Button>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
            Already have a Recipient account?{" "}
            <Link to="/login" className="text-[#315B83] font-bold hover:underline">
              Sign In here →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
