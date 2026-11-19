import React, { useState, useEffect } from "react";
import { donorService } from "../../services/donorService";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Droplet,
  MapPin,
  ShieldCheck,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  Heart,
  Scale,
  Pill,
  Activity,
  FileText,
  Clock,
} from "lucide-react";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import BloodGroupBadge from "../../components/common/BloodGroupBadge";
import { BLOOD_GROUPS, GENDER_OPTIONS } from "../../constants/theme";
import { INDIA_STATES_AND_CITIES, INDIAN_STATES_LIST } from "../../constants/indiaLocations";

export default function DonorProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingHq, setIsEditingHq] = useState(false);
  const [isSavingHq, setIsSavingHq] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bloodGroup: "",
    gender: "",
    dateOfBirth: "",
    state: "",
    city: "",
    pincode: "",
    isAvailable: true,
  });

  const [hqData, setHqData] = useState({
    currentWeight: "",
    medicalConditions: "",
    medications: "",
    recentIllnessOrFever: false,
    recentSurgery: false,
    previousDonation: false,
    lastDonationDate: "",
    additionalNotes: "",
  });

  const [errors, setErrors] = useState({});
  const [hqErrors, setHqErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bloodGroup: user.bloodGroup || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth || "",
        state: user.state || "",
        city: user.city || user.location || "",
        pincode: user.pincode || "",
        isAvailable: user.availability === "available",
      });

      if (user.healthQuestionnaire) {
        setHqData({
          currentWeight: user.healthQuestionnaire.currentWeight !== null && user.healthQuestionnaire.currentWeight !== undefined ? String(user.healthQuestionnaire.currentWeight) : "",
          medicalConditions: user.healthQuestionnaire.medicalConditions || "",
          medications: user.healthQuestionnaire.medications || "",
          recentIllnessOrFever: Boolean(user.healthQuestionnaire.recentIllnessOrFever),
          recentSurgery: Boolean(user.healthQuestionnaire.recentSurgery),
          previousDonation: Boolean(user.healthQuestionnaire.previousDonation),
          lastDonationDate: user.healthQuestionnaire.lastDonationDate || "",
          additionalNotes: user.healthQuestionnaire.additionalNotes || "",
        });
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
    } else if (id === "state") {
      setFormData((prev) => ({
        ...prev,
        state: value,
        city: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: type === "checkbox" ? checked : value,
      }));
    }

    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleHqChange = (e) => {
    const { id, value, type, checked } = e.target;
    setHqData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
    if (hqErrors[id]) {
      setHqErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";

    const cleanPhone = formData.phone.trim();
    if (!cleanPhone) {
      newErrors.phone = "10-digit mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number (starts with 6-9)";
    }

    if (!formData.bloodGroup) newErrors.bloodGroup = "Blood Group is required";

    if (formData.dateOfBirth) {
      const dobDate = new Date(formData.dateOfBirth);
      if (isNaN(dobDate.getTime())) {
        newErrors.dateOfBirth = "Please enter a valid date of birth";
      } else if (dobDate > new Date()) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future";
      } else {
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const m = today.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }
        if (age < 18) {
          newErrors.dateOfBirth = "Voluntary donors must be at least 18 years of age";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setNotice("");
    setErrorNotice("");

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        bloodGroup: formData.bloodGroup,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        availability: formData.isAvailable ? "available" : "not_available",
      };

      const res = await donorService.updateProfile(payload);
      updateUser(res.donor || payload);
      setNotice("Donor profile updated successfully.");
      setIsEditing(false);
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setErrorNotice(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveHq = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSavingHq(true);
    setNotice("");
    setErrorNotice("");

    if (hqData.currentWeight) {
      const w = Number(hqData.currentWeight);
      if (Number.isNaN(w) || w < 20 || w > 300) {
        setHqErrors({ currentWeight: "Weight must be between 20 kg and 300 kg" });
        setIsSavingHq(false);
        return;
      }
    }

    try {
      const res = await donorService.updateHealthQuestionnaire({
        currentWeight: hqData.currentWeight ? Number(hqData.currentWeight) : null,
        medicalConditions: hqData.medicalConditions,
        medications: hqData.medications,
        recentIllnessOrFever: hqData.recentIllnessOrFever,
        recentSurgery: hqData.recentSurgery,
        previousDonation: hqData.previousDonation,
        lastDonationDate: hqData.previousDonation ? hqData.lastDonationDate : "",
        additionalNotes: hqData.additionalNotes,
      });

      updateUser({ healthQuestionnaire: res.healthQuestionnaire });
      setNotice("Health questionnaire updated successfully.");
      setIsEditingHq(false);
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      console.error("Failed to update health questionnaire:", err);
      setErrorNotice(err.message || "Failed to save health questionnaire.");
    } finally {
      setIsSavingHq(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bloodGroup: user.bloodGroup || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth || "",
        state: user.state || "",
        city: user.city || user.location || "",
        pincode: user.pincode || "",
        isAvailable: user.isAvailable ?? (user.availability === "Available" || user.availability === "available"),
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const cityOptions = formData.state && INDIA_STATES_AND_CITIES[formData.state]
    ? INDIA_STATES_AND_CITIES[formData.state]
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100 font-bold text-xl">
            {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "D"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {formData.fullName || "Donor Profile"}
              </h1>
              {formData.bloodGroup && <BloodGroupBadge group={formData.bloodGroup} size="sm" />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>{formData.email}</span>
              <span>•</span>
              <span className="font-mono text-zinc-600 dark:text-zinc-400">Verified Voluntary Donor</span>
            </p>
          </div>
        </div>

        {!isEditing && (
          <Button variant="primary" size="sm" onClick={() => setIsEditing(true)} className="shrink-0 font-medium">
            <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
          </Button>
        )}
      </div>

      {/* Success Notification */}
      {notice && (
        <div className="p-3.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100" /> {notice}
          </span>
          <button onClick={() => setNotice("")} className="text-zinc-500 hover:text-zinc-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorNotice && (
        <div className="p-3.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-zinc-900 dark:text-zinc-100" /> {errorNotice}
          </span>
          <button onClick={() => setErrorNotice("")} className="text-zinc-500 hover:text-zinc-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Date of Birth Required Banner for Legacy Profiles */}
      {!formData.dateOfBirth && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Action Required: Complete Your Date of Birth</span>
            <p className="text-amber-700 dark:text-amber-300">
              To be eligible to receive active donation requests, voluntary blood donors must be at least 18 years of age. Please update your Date of Birth below.
            </p>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="ml-auto shrink-0 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700"
            >
              Update DOB
            </Button>
          )}
        </div>
      )}

      {/* Main Profile Info Box */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Personal & Location Details
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {isEditing ? "Editing Mode" : "Read-Only Overview"}
          </span>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                id="fullName"
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
                value={formData.email}
                disabled
                icon={Mail}
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
                label="Blood Group"
                id="bloodGroup"
                options={BLOOD_GROUPS}
                value={formData.bloodGroup}
                onChange={handleChange}
                error={errors.bloodGroup}
                placeholder="Select Blood Group"
                icon={Droplet}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <Input
                label="Date of Birth"
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                error={errors.dateOfBirth}
                icon={Calendar}
              />
            </div>

            {/* Dependent Location Dropdowns */}
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
              />

              <Select
                label="City"
                id="city"
                options={cityOptions}
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                placeholder={formData.state ? "Select City" : (formData.city || "Select State First")}
                icon={MapPin}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Pincode / Postal Code"
                id="pincode"
                value={formData.pincode}
                onChange={handleChange}
                error={errors.pincode}
                icon={MapPin}
              />
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <label htmlFor="isAvailable" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer block">
                  Donation Availability Status
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Toggle whether your profile appears in active emergency donor searches within 20 KM.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Profile
              </Button>
            </div>
          </form>
        ) : (
          /* READ-ONLY DISPLAY VIEW */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Full Name</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" /> {formData.fullName}
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Email Address</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" /> {formData.email}
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Mobile Number</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500" /> {formData.phone ? `+91 ${formData.phone}` : "Not set"}
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Blood Group</span>
                <div className="pt-0.5">
                  <BloodGroupBadge group={formData.bloodGroup} size="sm" />
                </div>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Gender</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" /> {formData.gender || "Not specified"}
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Date of Birth</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" /> {formData.dateOfBirth || "Not provided"}
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400">State / UT</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" /> {formData.state || "Not specified"}
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400">City / Region</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" /> {formData.city || "Not specified"}
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800 sm:col-span-2">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Pincode</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{formData.pincode || "Not specified"}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">Contact Privacy Protection Active</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Your mobile number and exact residential location are protected from public recipient searches. They are only disclosed when you voluntarily accept a blood request.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HEALTH QUESTIONNAIRE CARD */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Donor Health & Eligibility Questionnaire
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Preliminary self-reported health record. Not accessible to recipients or public search.
            </p>
          </div>
          {!isEditingHq && (
            <Button variant="outline" size="sm" onClick={() => setIsEditingHq(true)} className="shrink-0 font-medium">
              <Edit className="w-3.5 h-3.5 mr-1.5" /> Update Health Info
            </Button>
          )}
        </div>

        {/* Medical Safety Disclaimer & Privacy Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs">
            <div className="font-semibold flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              Medical Safety Disclaimer
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              This questionnaire is for self-reported preliminary information only. Final medical suitability is determined by authorized blood-bank personnel. Availability status does not constitute clinical clearance.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200 text-xs">
            <div className="font-semibold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              Privacy & Access Restriction
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Health responses are strictly private to your donor account and authorized administrators. They are never transmitted in discovery searches, socket broadcasts, or to recipients.
            </p>
          </div>
        </div>

        {isEditingHq ? (
          <form onSubmit={handleSaveHq} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Current Weight (kg) - Optional"
                id="currentWeight"
                type="number"
                placeholder="e.g. 68"
                min="20"
                max="300"
                value={hqData.currentWeight}
                onChange={handleHqChange}
                error={hqErrors.currentWeight}
                icon={Scale}
              />

              <Input
                label="Current Medications (if any)"
                id="medications"
                placeholder="e.g. None / Multivitamins"
                value={hqData.medications}
                onChange={handleHqChange}
                icon={Pill}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Relevant Medical Conditions / History"
                id="medicalConditions"
                placeholder="e.g. None / Mild asthma"
                value={hqData.medicalConditions}
                onChange={handleHqChange}
                icon={Heart}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <label htmlFor="recentIllnessOrFever" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer block">
                    Recent Illness or Fever (past 30 days)
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Self-report any viral fever, flu, or infection.
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="recentIllnessOrFever"
                  checked={hqData.recentIllnessOrFever}
                  onChange={handleHqChange}
                  className="w-4 h-4 text-zinc-900 rounded border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <label htmlFor="recentSurgery" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer block">
                    Recent Surgery (past 6 months)
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Minor or major surgical procedures.
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="recentSurgery"
                  checked={hqData.recentSurgery}
                  onChange={handleHqChange}
                  className="w-4 h-4 text-zinc-900 rounded border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <label htmlFor="previousDonation" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer block">
                    Have you donated blood before?
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Prior voluntary donation experience.
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="previousDonation"
                  checked={hqData.previousDonation}
                  onChange={handleHqChange}
                  className="w-4 h-4 text-zinc-900 rounded border-slate-300 dark:border-slate-700"
                />
              </div>

              {hqData.previousDonation && (
                <Input
                  label="Last Blood Donation Date"
                  id="lastDonationDate"
                  type="date"
                  value={hqData.lastDonationDate}
                  onChange={handleHqChange}
                  icon={Clock}
                />
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Additional Health Notes (Optional)"
                id="additionalNotes"
                placeholder="Any other details relevant to voluntary blood donation"
                value={hqData.additionalNotes}
                onChange={handleHqChange}
                icon={FileText}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsEditingHq(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSavingHq}>
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Health Questionnaire
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Current Weight</span>
              <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-slate-500" /> {hqData.currentWeight ? `${hqData.currentWeight} kg` : "Not specified"}
              </p>
            </div>

            <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Current Medications</span>
              <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Pill className="w-4 h-4 text-slate-500" /> {hqData.medications || "None reported"}
              </p>
            </div>

            <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800 sm:col-span-2">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Medical Conditions</span>
              <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-slate-500" /> {hqData.medicalConditions || "None reported"}
              </p>
            </div>

            <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Recent Illness/Fever</span>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                {hqData.recentIllnessOrFever ? "Yes (Reported in past 30 days)" : "No"}
              </p>
            </div>

            <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Recent Surgery</span>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                {hqData.recentSurgery ? "Yes (Reported in past 6 months)" : "No"}
              </p>
            </div>

            <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800 sm:col-span-2">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Donation History</span>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                {hqData.previousDonation
                  ? `Previously donated${hqData.lastDonationDate ? ` (Last donation: ${hqData.lastDonationDate})` : ""}`
                  : "First-time donor"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}