import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Edit3,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  XCircle,
} from "lucide-react";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import { GENDER_OPTIONS } from "../../constants/theme";
import { INDIA_STATES_AND_CITIES, INDIAN_STATES_LIST } from "../../constants/indiaLocations";

export default function RecipientProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    state: user?.state || "",
    city: user?.city || "",
    pincode: user?.pincode || "",
    gender: user?.gender || "",
    hospitalName: user?.hospitalName || "",
    hospitalAddress: user?.hospitalAddress || "",
    hospitalContactPhone: user?.hospitalContactPhone || "",
    representativeDesignation: user?.representativeDesignation || "",
    authorizationNotes: user?.authorizationNotes || "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        state: user.state || "",
        city: user.city || "",
        pincode: user.pincode || "",
        gender: user.gender || "",
        hospitalName: user.hospitalName || "",
        hospitalAddress: user.hospitalAddress || "",
        hospitalContactPhone: user.hospitalContactPhone || "",
        representativeDesignation: user.representativeDesignation || "",
        authorizationNotes: user.authorizationNotes || "",
      });
    }
  }, [user, isEditing]);

  const cityOptions = formData.state ? (INDIA_STATES_AND_CITIES[formData.state] || []) : [];

  const handleChange = (e) => {
    const { id, value } = e.target;

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
      setFormData((prev) => ({ ...prev, [id]: value }));
    }

    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
    if (successMsg) setSuccessMsg("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email address required";
    }

    const cleanPhone = formData.phone.trim();
    if (!cleanPhone) {
      newErrors.phone = "10-digit mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number (starts with 6-9)";
    }

    if (user?.accountType === "hospital_rep" && !formData.hospitalName.trim()) {
      newErrors.hospitalName = "Hospital name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode.trim(),
        gender: formData.gender,
      };

      if (user?.accountType === "hospital_rep") {
        payload.hospitalName = formData.hospitalName.trim();
        payload.hospitalAddress = formData.hospitalAddress.trim();
        payload.hospitalContactPhone = formData.hospitalContactPhone.trim();
        payload.representativeDesignation = formData.representativeDesignation.trim();
        payload.authorizationNotes = formData.authorizationNotes.trim();
      }

      const res = await authService.updateProfile(payload);
      if (res && res.user) {
        updateUser(res.user);
      } else {
        updateUser(payload);
      }
      setIsEditing(false);
      setSuccessMsg("Recipient profile updated successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err.message || "Failed to save recipient profile",
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      state: user?.state || "",
      city: user?.city || "",
      pincode: user?.pincode || "",
      gender: user?.gender || "",
      hospitalName: user?.hospitalName || "",
      hospitalAddress: user?.hospitalAddress || "",
      hospitalContactPhone: user?.hospitalContactPhone || "",
      representativeDesignation: user?.representativeDesignation || "",
      authorizationNotes: user?.authorizationNotes || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  const isHospitalRep = user?.accountType === "hospital_rep";
  const verificationStatus = user?.verificationStatus || (isHospitalRep ? "pending" : "verified");

  return (
    <div className="space-y-6 pb-12">
      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-medium flex items-center justify-between shadow-2xs font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-zinc-500 hover:text-zinc-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form error notification */}
      {errors.form && (
        <div className="p-3.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-medium flex items-center justify-between shadow-2xs font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
            <span>{errors.form}</span>
          </div>
          <button onClick={() => setErrors((prev) => ({ ...prev, form: "" }))} className="text-zinc-500 hover:text-zinc-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Institutional Verification Status Alert Banner */}
      {isHospitalRep && verificationStatus === "pending" && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-amber-950 dark:text-amber-100">
              Hospital Account Verification Pending
            </h4>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
              Your hospital representative credentials for <strong>{formData.hospitalName || "your institution"}</strong> are currently under administrative review. You can create blood requests, but they will be held in <em>Pending Verification</em> status and will not dispatch to matching donors until verified by administrators.
            </p>
          </div>
        </div>
      )}

      {isHospitalRep && verificationStatus === "rejected" && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 text-xs text-red-900 dark:text-red-200 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-red-950 dark:text-red-100">
              Hospital Account Verification Rejected
            </h4>
            <p className="text-red-800 dark:text-red-300 leading-relaxed">
              Reason: {user?.verificationRejectionReason || "Verification criteria could not be confirmed."} Please update your institutional details and contact administrative support.
            </p>
          </div>
        </div>
      )}

      {/* Profile Header & Summary */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 flex items-center justify-center font-bold text-xl">
            {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "R"}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {formData.fullName || "Recipient User"}
              </h1>
              {isHospitalRep && (
                <StatusBadge status={verificationStatus === "verified" ? "Verified" : verificationStatus === "rejected" ? "Rejected" : "Pending Verification"} />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium uppercase tracking-wider text-[10px] border border-slate-200 dark:border-slate-700">
                {isHospitalRep ? "Hospital Representative" : "Individual Recipient"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {formData.city ? (formData.state ? formData.city + ", " + formData.state : formData.city) : "Location Not Set"}
              </span>
              {isHospitalRep && formData.hospitalName && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {formData.hospitalName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>
              <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" isLoading={isSaving} onClick={handleSave}>
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Details Section */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Recipient Account Details
          </h2>
          <span className="text-xs text-slate-400">
            {isEditing ? "Editing Mode" : "Read-Only Overview"}
          </span>
        </div>

        {isEditing ? (
          /* EDIT FORM */
          <form onSubmit={handleSave} className="space-y-4">
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
                label="City / Search Location"
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

            {/* Hospital Details in Edit Mode */}
            {isHospitalRep && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Hospital / Institutional Information
                  </h3>
                </div>

                <Input
                  label="Hospital / Clinic Name"
                  id="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  error={errors.hospitalName}
                  icon={Building2}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Representative Designation"
                    id="representativeDesignation"
                    value={formData.representativeDesignation}
                    onChange={handleChange}
                    icon={User}
                  />

                  <Input
                    label="Hospital Contact / Desk Phone"
                    id="hospitalContactPhone"
                    value={formData.hospitalContactPhone}
                    onChange={handleChange}
                    icon={Phone}
                  />
                </div>

                <Input
                  label="Hospital Address / Facility Unit"
                  id="hospitalAddress"
                  value={formData.hospitalAddress}
                  onChange={handleChange}
                  icon={MapPin}
                />
              </div>
            )}

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
          /* READ-ONLY VIEW */
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
                <span className="text-[10px] uppercase font-semibold text-slate-400">Gender</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" /> {formData.gender || "Not specified"}
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400">State / UT</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" /> {formData.state || "Not specified"}
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400">City / Location</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" /> {formData.city || "Not specified"}
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800 sm:col-span-2">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Pincode</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{formData.pincode || "Not specified"}</p>
              </div>
            </div>

            {/* Institutional Information Read-Only Card */}
            {isHospitalRep && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Hospital / Institutional Profile
                    </h3>
                  </div>
                  <StatusBadge status={verificationStatus === "verified" ? "Verified" : verificationStatus === "rejected" ? "Rejected" : "Pending Verification"} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Hospital Name</span>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-500" /> {formData.hospitalName || "Not specified"}
                    </p>
                  </div>

                  <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Designation</span>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-500" /> {formData.representativeDesignation || "Not specified"}
                    </p>
                  </div>

                  <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Hospital Contact Phone</span>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-500" /> {formData.hospitalContactPhone || "Not specified"}
                    </p>
                  </div>

                  <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Hospital Address</span>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" /> {formData.hospitalAddress || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Recipient Account Security Active</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your contact details are shared only with matching donors who explicitly accept your blood requests.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
