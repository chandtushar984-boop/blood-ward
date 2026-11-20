import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import AppError from "../utils/appError.js";
import { logAuditEvent } from "../utils/auditLogger.js";
import { ALLOWED_GENDERS, isValidPincode, normalizeIndianPhone, validateDonorDOB } from "../utils/validators.js";

const signToken = (id, role) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is missing from environment configuration");
  }
  return jwt.sign({ id, role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const sendTokenResponse = (user, statusCode, res, message = "Success") => {
  const token = signToken(user._id, user.role);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie("token", token, cookieOptions);

  const safeUser = {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    gender: user.gender || "",
    bloodGroup: user.bloodGroup || null,
    state: user.state || "",
    city: user.city || "",
    pincode: user.pincode || "",
    availability: user.availability || "not_available",
    isBlocked: user.isBlocked || false,
    dateOfBirth: user.dateOfBirth || "",
    healthQuestionnaire: user.role === "donor" ? (user.healthQuestionnaire || {}) : undefined,
    accountType: user.accountType || "individual",
    hospitalName: user.hospitalName || "",
    hospitalAddress: user.hospitalAddress || "",
    hospitalContactPhone: user.hospitalContactPhone || "",
    representativeDesignation: user.representativeDesignation || "",
    authorizationNotes: user.authorizationNotes || "",
    verificationStatus: user.verificationStatus || (user.accountType === "hospital_rep" ? "pending" : "verified"),
    verificationRejectionReason: user.verificationRejectionReason || "",
    verifiedAt: user.verifiedAt || null,
  };

  res.status(statusCode).json({
    success: true,
    message,
    user: safeUser,
  });
};

export const registerDonor = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      gender,
      password,
      bloodGroup,
      state,
      city,
      pincode,
      dateOfBirth,
      healthQuestionnaire,
      isAvailable,
      availability,
    } = req.body;

    if (!fullName || !email || !phone || !password || !bloodGroup) {
      return next(new AppError("Full Name, Email, Phone, Password, and Blood Group are required for donor registration.", 400));
    }

    // Date of Birth is mandatory for voluntary donor registration
    const dobValidation = validateDonorDOB(dateOfBirth);
    if (!dobValidation.isValid) {
      return next(new AppError(dobValidation.message, 400));
    }

    const normalizedPhone = normalizeIndianPhone(phone);
    if (!normalizedPhone) {
      return next(new AppError("Please provide a valid 10-digit Indian mobile number.", 400));
    }

    if (gender !== undefined && gender !== "" && !ALLOWED_GENDERS.includes(gender)) {
      return next(new AppError("Invalid gender value provided.", 400));
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new AppError("An account with this email address already exists.", 400));
    }

    let donorAvailability = "not_available";
    if (availability === "available" || isAvailable === true || isAvailable === "true") {
      donorAvailability = "available";
    }

    const donorData = {
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      gender: gender ? gender.trim() : "",
      password,
      role: "donor",
      bloodGroup,
      state: state ? state.trim() : "",
      city: city ? city.trim() : "",
      pincode: pincode ? pincode.trim() : "",
      dateOfBirth: dateOfBirth ? String(dateOfBirth).trim() : "",
      availability: donorAvailability,
    };

    if (healthQuestionnaire && typeof healthQuestionnaire === "object") {
      donorData.healthQuestionnaire = {
        currentWeight: healthQuestionnaire.currentWeight ? Number(healthQuestionnaire.currentWeight) : null,
        medicalConditions: healthQuestionnaire.medicalConditions ? String(healthQuestionnaire.medicalConditions).trim() : "",
        medications: healthQuestionnaire.medications ? String(healthQuestionnaire.medications).trim() : "",
        recentIllnessOrFever: Boolean(healthQuestionnaire.recentIllnessOrFever),
        recentSurgery: Boolean(healthQuestionnaire.recentSurgery),
        previousDonation: Boolean(healthQuestionnaire.previousDonation),
        lastDonationDate: healthQuestionnaire.lastDonationDate ? String(healthQuestionnaire.lastDonationDate).trim() : "",
        additionalNotes: healthQuestionnaire.additionalNotes ? String(healthQuestionnaire.additionalNotes).trim() : "",
        updatedAt: new Date(),
      };
    }

    const newUser = await User.create(donorData);

    logAuditEvent({
      actor: newUser._id,
      actorName: newUser.fullName,
      action: "REGISTER_DONOR",
      category: "AUTH",
      target: newUser._id.toString(),
      ipAddress: req.ip,
      severity: "NORMAL",
    });

    sendTokenResponse(newUser, 201, res, "Donor registration successful.");
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError("An account with this email address already exists.", 400));
    }
    next(error);
  }
};

export const registerRecipient = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      gender,
      password,
      location,
      state,
      city,
      accountType = "individual",
      hospitalName,
      hospitalAddress,
      hospitalContactPhone,
      representativeDesignation,
      authorizationNotes,
    } = req.body;

    if (!fullName || !email || !phone || !password) {
      return next(new AppError("Full Name, Email, Phone, and Password are required for recipient registration.", 400));
    }

    const normalizedPhone = normalizeIndianPhone(phone);
    if (!normalizedPhone) {
      return next(new AppError("Please provide a valid 10-digit Indian mobile number.", 400));
    }

    if (gender !== undefined && gender !== "" && !ALLOWED_GENDERS.includes(gender)) {
      return next(new AppError("Invalid gender value provided.", 400));
    }

    const isHospitalRep = accountType === "hospital_rep";
    if (isHospitalRep) {
      if (!hospitalName || typeof hospitalName !== "string" || !hospitalName.trim()) {
        return next(new AppError("Hospital or medical centre name is required for hospital representative registration.", 400));
      }
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new AppError("An account with this email address already exists.", 400));
    }

    const recipientCity = (location || city || "").trim();

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      gender: gender ? gender.trim() : "",
      password,
      role: "recipient",
      state: state ? state.trim() : "",
      city: recipientCity,
      accountType: isHospitalRep ? "hospital_rep" : "individual",
      hospitalName: isHospitalRep ? hospitalName.trim() : "",
      hospitalAddress: isHospitalRep && hospitalAddress ? hospitalAddress.trim() : "",
      hospitalContactPhone: isHospitalRep && hospitalContactPhone ? hospitalContactPhone.trim() : "",
      representativeDesignation: isHospitalRep && representativeDesignation ? representativeDesignation.trim() : "",
      authorizationNotes: isHospitalRep && authorizationNotes ? authorizationNotes.trim() : "",
      verificationStatus: isHospitalRep ? "pending" : "verified",
    });

    logAuditEvent({
      actor: newUser._id,
      actorName: newUser.fullName,
      action: isHospitalRep ? "REGISTER_HOSPITAL_REPRESENTATIVE" : "REGISTER_RECIPIENT",
      category: "AUTH",
      target: newUser._id.toString(),
      ipAddress: req.ip,
      severity: "NORMAL",
      details: isHospitalRep ? `Hospital representative registered for ${hospitalName.trim()} (Pending Verification).` : "Individual recipient registered.",
    });

    sendTokenResponse(newUser, 201, res, isHospitalRep ? "Hospital representative registration submitted. Account is pending verification." : "Recipient registration successful.");
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError("An account with this email address already exists.", 400));
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, role: requestedRole } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide both email address and password.", 400));
    }

    const ALLOWED_ROLES = ["admin", "donor", "recipient"];
    if (requestedRole !== undefined && !ALLOWED_ROLES.includes(requestedRole)) {
      return next(new AppError("Invalid role requested.", 400));
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return next(new AppError("Invalid login credentials", 401));
    }

    if (user.isBlocked) {
      logAuditEvent({
        actor: user._id,
        actorName: user.fullName,
        action: "BLOCKED_LOGIN_ATTEMPT",
        category: "SECURITY",
        target: user.email,
        ipAddress: req.ip,
        severity: "HIGH",
      });
      return next(new AppError("Your account has been blocked by system administration.", 403));
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new AppError("Invalid login credentials", 401));
    }

    if (requestedRole && requestedRole !== user.role) {
      const roleDisplayNames = {
        admin: "Admin",
        donor: "Donor",
        recipient: "Recipient",
      };
      const actualRoleLabel = roleDisplayNames[user.role] || user.role;
      return next(
        new AppError(
          `This account is registered as a ${actualRoleLabel}. Please select ${actualRoleLabel} login.`,
          403
        )
      );
    }

    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });

    logAuditEvent({
      actor: user._id,
      actorName: user.fullName,
      action: "LOGIN_SUCCESS",
      category: "AUTH",
      target: user.email,
      ipAddress: req.ip,
      severity: "NORMAL",
    });

    sendTokenResponse(user, 200, res, "Logged in successfully.");
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  if (req.user) {
    logAuditEvent({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: "LOGOUT",
      category: "AUTH",
      target: req.user.email,
      ipAddress: req.ip,
      severity: "NORMAL",
    });
  }

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

export const getMe = async (req, res, next) => {
  try {
    let currentUser = req.user;

    if (!currentUser) {
      let token = req.cookies?.token;

      if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token || token === "logout" || token === "null" || token === "undefined") {
        return res.status(200).json({
          success: true,
          authenticated: false,
          user: null,
        });
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return next(new AppError("Server authentication misconfigured.", 500));
      }

      let decoded;
      try {
        decoded = jwt.verify(token, secret);
      } catch {
        // Expired or invalid token: return clean unauthenticated status without raising 401
        return res.status(200).json({
          success: true,
          authenticated: false,
          user: null,
        });
      }

      currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return res.status(200).json({
          success: true,
          authenticated: false,
          user: null,
        });
      }
    }

    if (currentUser.isBlocked) {
      return next(new AppError("Your account has been blocked by system administration.", 403));
    }

    const safeUser = {
      id: currentUser._id,
      fullName: currentUser.fullName,
      email: currentUser.email,
      phone: currentUser.phone,
      role: currentUser.role,
      gender: currentUser.gender || "",
      bloodGroup: currentUser.bloodGroup || null,
      state: currentUser.state || "",
      city: currentUser.city || "",
      pincode: currentUser.pincode || "",
      availability: currentUser.availability || "not_available",
      isBlocked: currentUser.isBlocked || false,
      dateOfBirth: currentUser.dateOfBirth || "",
      healthQuestionnaire: currentUser.role === "donor" ? (currentUser.healthQuestionnaire || {}) : undefined,
      accountType: currentUser.accountType || "individual",
      hospitalName: currentUser.hospitalName || "",
      hospitalAddress: currentUser.hospitalAddress || "",
      hospitalContactPhone: currentUser.hospitalContactPhone || "",
      representativeDesignation: currentUser.representativeDesignation || "",
      authorizationNotes: currentUser.authorizationNotes || "",
      verificationStatus: currentUser.verificationStatus || (currentUser.accountType === "hospital_rep" ? "pending" : "verified"),
      verificationRejectionReason: currentUser.verificationRejectionReason || "",
      verifiedAt: currentUser.verifiedAt || null,
    };

    res.status(200).json({
      success: true,
      authenticated: true,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      gender,
      state,
      city,
      pincode,
      dateOfBirth,
      hospitalName,
      hospitalAddress,
      hospitalContactPhone,
      representativeDesignation,
      authorizationNotes,
    } = req.body;

    if (fullName !== undefined) {
      if (typeof fullName !== "string" || !fullName.trim()) {
        return next(new AppError("Full Name must be a non-empty text string.", 400));
      }
      req.user.fullName = fullName.trim();
    }

    if (phone !== undefined) {
      const normalizedPhone = normalizeIndianPhone(phone);
      if (!normalizedPhone) {
        return next(new AppError("Please provide a valid 10-digit Indian mobile number.", 400));
      }
      req.user.phone = normalizedPhone;
    }

    if (gender !== undefined) {
      if (gender !== "" && !ALLOWED_GENDERS.includes(gender)) {
        return next(new AppError("Invalid gender value provided.", 400));
      }
      req.user.gender = gender ? gender.trim() : "";
    }

    if (dateOfBirth !== undefined) {
      req.user.dateOfBirth = dateOfBirth ? String(dateOfBirth).trim() : "";
    }

    if (req.user.role === "recipient" && req.user.accountType === "hospital_rep") {
      if (hospitalName !== undefined) req.user.hospitalName = String(hospitalName).trim();
      if (hospitalAddress !== undefined) req.user.hospitalAddress = String(hospitalAddress).trim();
      if (hospitalContactPhone !== undefined) req.user.hospitalContactPhone = String(hospitalContactPhone).trim();
      if (representativeDesignation !== undefined) req.user.representativeDesignation = String(representativeDesignation).trim();
      if (authorizationNotes !== undefined) req.user.authorizationNotes = String(authorizationNotes).trim();
    }

    if (state !== undefined) {
      if (typeof state !== "string") {
        return next(new AppError("State must be a valid text string.", 400));
      }
      req.user.state = state.trim();
    }

    if (city !== undefined) {
      if (typeof city !== "string") {
        return next(new AppError("City must be a valid text string.", 400));
      }
      req.user.city = city.trim();
    }

    if (pincode !== undefined) {
      if (!isValidPincode(pincode)) {
        return next(new AppError("Invalid pincode format.", 400));
      }
      req.user.pincode = typeof pincode === "string" ? pincode.trim() : "";
    }

    req.user.lastActiveAt = new Date();
    await req.user.save({ validateBeforeSave: true });

    const safeUser = {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      gender: req.user.gender || "",
      bloodGroup: req.user.bloodGroup || null,
      state: req.user.state || "",
      city: req.user.city || "",
      pincode: req.user.pincode || "",
      availability: req.user.availability || "not_available",
      isBlocked: req.user.isBlocked || false,
    };

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};
