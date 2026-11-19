import User from "../models/user.model.js";
import AppError from "../utils/appError.js";
import { emitToRole } from "../socket.js";
import { logAuditEvent } from "../utils/auditLogger.js";
import { getCompatibleDonorBloodGroups } from "../utils/bloodCompatibility.js";
import {
  isValidGeoCoordinates,
  isValidBloodGroup,
  isValidAvailability,
  isValidPincode,
  normalizeIndianPhone,
  ALLOWED_GENDERS,
  validateDonorDOB,
} from "../utils/validators.js";
import {
  sanitizeDonorProfile,
  sanitizeDonorSearchResult,
} from "../utils/donorSanitizer.js";

/**
 * @desc    Get current authenticated donor profile
 * @route   GET /api/donors/me
 * @access  Private (Donor only)
 */
export const getDonorProfile = async (req, res, next) => {
  try {
    const safeDonor = sanitizeDonorProfile(req.user);
    res.status(200).json({
      success: true,
      donor: safeDonor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current authenticated donor profile
 * @route   PUT /api/donors/me
 * @access  Private (Donor only)
 */
export const updateDonorProfile = async (req, res, next) => {
  try {
    const {
      bloodGroup,
      state,
      city,
      pincode,
      fullName,
      phone,
      gender,
      dateOfBirth,
      healthQuestionnaire,
      availability,
      isAvailable,
      location,
    } = req.body;

    if (location !== undefined && location !== null) {
      if (
        !location.coordinates ||
        !Array.isArray(location.coordinates) ||
        !isValidGeoCoordinates(location.coordinates[0], location.coordinates[1])
      ) {
        return next(
          new AppError("Invalid location coordinates provided. Longitude [-180, 180], Latitude [-90, 90].", 400)
        );
      }
      req.user.location = {
        type: "Point",
        coordinates: [Number(location.coordinates[0]), Number(location.coordinates[1])],
      };
    }

    if (availability !== undefined || isAvailable !== undefined) {
      const targetAvail = availability || (isAvailable !== undefined ? (isAvailable ? "available" : "not_available") : null);
      if (targetAvail && isValidAvailability(targetAvail)) {
        req.user.availability = targetAvail;
      }
    }

    if (fullName !== undefined) {
      if (typeof fullName !== "string" || !fullName.trim()) {
        return next(new AppError("Full Name must be a valid non-empty string.", 400));
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

    if (bloodGroup !== undefined) {
      if (!isValidBloodGroup(bloodGroup)) {
        return next(
          new AppError(
            "Invalid blood group provided. Allowed values: A+, A-, B+, B-, AB+, AB-, O+, O-.",
            400
          )
        );
      }
      req.user.bloodGroup = bloodGroup;
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

    if (dateOfBirth !== undefined) {
      if (dateOfBirth !== "" && dateOfBirth !== null) {
        const dobValidation = validateDonorDOB(dateOfBirth);
        if (!dobValidation.isValid) {
          return next(new AppError(dobValidation.message, 400));
        }
      }
      req.user.dateOfBirth = dateOfBirth ? String(dateOfBirth).trim() : "";
    }

    if (healthQuestionnaire && typeof healthQuestionnaire === "object") {
      const q = req.user.healthQuestionnaire || {};
      req.user.healthQuestionnaire = {
        currentWeight: healthQuestionnaire.currentWeight !== undefined && healthQuestionnaire.currentWeight !== "" ? (healthQuestionnaire.currentWeight !== null ? Number(healthQuestionnaire.currentWeight) : null) : q.currentWeight,
        medicalConditions: healthQuestionnaire.medicalConditions !== undefined ? String(healthQuestionnaire.medicalConditions).trim() : (q.medicalConditions || ""),
        medications: healthQuestionnaire.medications !== undefined ? String(healthQuestionnaire.medications).trim() : (q.medications || ""),
        recentIllnessOrFever: healthQuestionnaire.recentIllnessOrFever !== undefined ? Boolean(healthQuestionnaire.recentIllnessOrFever) : (q.recentIllnessOrFever || false),
        recentSurgery: healthQuestionnaire.recentSurgery !== undefined ? Boolean(healthQuestionnaire.recentSurgery) : (q.recentSurgery || false),
        previousDonation: healthQuestionnaire.previousDonation !== undefined ? Boolean(healthQuestionnaire.previousDonation) : (q.previousDonation || false),
        lastDonationDate: healthQuestionnaire.lastDonationDate !== undefined ? String(healthQuestionnaire.lastDonationDate).trim() : (q.lastDonationDate || ""),
        additionalNotes: healthQuestionnaire.additionalNotes !== undefined ? String(healthQuestionnaire.additionalNotes).trim() : (q.additionalNotes || ""),
        updatedAt: new Date(),
      };
    }

    req.user.lastActiveAt = new Date();
    await req.user.save({ validateBeforeSave: true });

    if (availability !== undefined || isAvailable !== undefined) {
      const availPayload = {
        donorId: req.user._id.toString(),
        availability: req.user.availability,
        isAvailable: req.user.availability === "available",
        bloodGroup: req.user.bloodGroup,
        city: req.user.city,
        state: req.user.state,
      };
      emitToRole("recipient", "donor:availabilityChanged", availPayload);
      emitToRole("recipient", "donor:availability_updated", availPayload);
    }

    res.status(200).json({
      success: true,
      message: "Donor profile updated successfully.",
      donor: sanitizeDonorProfile(req.user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current authenticated donor availability status
 * @route   PATCH /api/donors/me/availability
 * @access  Private (Donor only)
 */
export const updateDonorAvailability = async (req, res, next) => {
  try {
    const { availability, isAvailable } = req.body;
    const targetAvailability = availability || (isAvailable !== undefined ? (isAvailable ? "available" : "not_available") : null);

    if (!targetAvailability || !isValidAvailability(targetAvailability)) {
      return next(
        new AppError('Availability must be either "available" or "not_available".', 400)
      );
    }

    req.user.availability = targetAvailability;
    req.user.lastActiveAt = new Date();

    await req.user.save({ validateBeforeSave: false });

    const availPayload = {
      donorId: req.user._id.toString(),
      availability: req.user.availability,
      isAvailable: req.user.availability === "available",
      bloodGroup: req.user.bloodGroup,
      city: req.user.city,
      state: req.user.state,
    };
    emitToRole("recipient", "donor:availabilityChanged", availPayload);
    emitToRole("recipient", "donor:availability_updated", availPayload);

    res.status(200).json({
      success: true,
      message: "Donor availability status updated successfully.",
      availability: req.user.availability,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Recipient search for available donors with geospatial support
 * @route   GET /api/donors/search
 * @access  Private (Recipient only)
 */
export const searchDonors = async (req, res, next) => {
  try {
    // Strict query parameter allowlist to prevent query parameter and operator injection
    const allowedQueryParams = ["bloodGroup", "latitude", "longitude", "radius", "location", "sort", "page", "limit"];
    for (const key of Object.keys(req.query)) {
      if (!allowedQueryParams.includes(key) || (typeof req.query[key] === "object" && req.query[key] !== null)) {
        return next(new AppError("Invalid or unrecognized query parameter: " + key, 400));
      }
    }

    const { bloodGroup, latitude, longitude, radius, location, sort = "nearest", page = 1, limit = 10 } = req.query;

    // Validate bloodGroup filter if supplied
    if (bloodGroup !== undefined && bloodGroup !== "") {
      if (typeof bloodGroup !== "string" || !isValidBloodGroup(bloodGroup)) {
        return next(new AppError("Invalid blood group filter provided.", 400));
      }
    }

    // Validate sort option
    const allowedSorts = ["nearest", "farthest", "recently_active"];
    if (typeof sort !== "string" || !allowedSorts.includes(sort)) {
      return next(
        new AppError("Invalid sort option. Allowed values: nearest, farthest, recently_active.", 400)
      );
    }

    // Validate pagination parameters
    const pageNum = parseInt(page, 10);
    let limitNum = parseInt(limit, 10);

    if (Number.isNaN(pageNum) || pageNum < 1) {
      return next(new AppError("Page number must be a positive integer.", 400));
    }
    if (Number.isNaN(limitNum) || limitNum < 1) {
      return next(new AppError("Limit must be a positive integer.", 400));
    }

    // Protection against excessive pagination limits
    if (limitNum > 50) {
      limitNum = 50;
    }

    const isAnyLocation = radius === "any" || location === "any";
    const hasCoordinates = latitude !== undefined && longitude !== undefined;
    const hasLocationParams = latitude !== undefined || longitude !== undefined || radius !== undefined || location !== undefined;

    let sanitizedDonors = [];
    let totalDocs = 0;

    const matchCriteria = {
      role: "donor",
      availability: "available",
      isBlocked: false,
    };

    if (bloodGroup && typeof bloodGroup === "string" && bloodGroup.trim() !== "") {
      const compatibleDonorGroups = getCompatibleDonorBloodGroups(bloodGroup.trim());
      matchCriteria.bloodGroup = { $in: compatibleDonorGroups };
    }

    if (isAnyLocation) {
      if (hasCoordinates) {
        const lat = Number(latitude);
        const lng = Number(longitude);

        if (!isValidGeoCoordinates(lng, lat)) {
          return next(
            new AppError("Invalid coordinates. Longitude must be [-180, 180] and Latitude [-90, 90].", 400)
          );
        }

        const pipeline = [
          {
            $geoNear: {
              near: { type: "Point", coordinates: [lng, lat] },
              distanceField: "distanceMeters",
              query: matchCriteria,
              spherical: true,
            },
          },
        ];

        if (sort === "farthest") {
          pipeline.push({ $sort: { distanceMeters: -1 } });
        } else if (sort === "recently_active") {
          pipeline.push({ $sort: { lastActiveAt: -1 } });
        }

        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await User.aggregate(countPipeline);
        totalDocs = countResult.length > 0 ? countResult[0].total : 0;

        const skip = (pageNum - 1) * limitNum;
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limitNum });

        const results = await User.aggregate(pipeline);

        sanitizedDonors = results.map((doc) =>
          sanitizeDonorSearchResult(doc, doc.distanceMeters / 1000)
        );
      } else {
        totalDocs = await User.countDocuments(matchCriteria);

        let sortOptions = { createdAt: -1 };
        if (sort === "recently_active") {
          sortOptions = { lastActiveAt: -1 };
        } else if (sort === "farthest") {
          sortOptions = { createdAt: 1 };
        }

        const skip = (pageNum - 1) * limitNum;
        const results = await User.find(matchCriteria).sort(sortOptions).skip(skip).limit(limitNum);

        sanitizedDonors = results.map((doc) => sanitizeDonorSearchResult(doc, null));
      }
    } else if (hasLocationParams) {
      if (latitude === undefined || longitude === undefined) {
        return next(new AppError("Both latitude and longitude parameters are required for location search.", 400));
      }

      const lat = Number(latitude);
      const lng = Number(longitude);

      if (!isValidGeoCoordinates(lng, lat)) {
        return next(
          new AppError("Invalid coordinates. Longitude must be [-180, 180] and Latitude [-90, 90].", 400)
        );
      }

      const radiusKm = radius !== undefined ? Number(radius) : 10;
      if (Number.isNaN(radiusKm) || radiusKm <= 0 || radiusKm > 500) {
        return next(new AppError("Radius must be a positive number between 0.1 and 500 kilometers.", 400));
      }

      const radiusMeters = radiusKm * 1000;

      const pipeline = [
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
            distanceField: "distanceMeters",
            maxDistance: radiusMeters,
            query: matchCriteria,
            spherical: true,
          },
        },
      ];

      if (sort === "farthest") {
        pipeline.push({ $sort: { distanceMeters: -1 } });
      } else if (sort === "recently_active") {
        pipeline.push({ $sort: { lastActiveAt: -1 } });
      }

      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await User.aggregate(countPipeline);
      totalDocs = countResult.length > 0 ? countResult[0].total : 0;

      const skip = (pageNum - 1) * limitNum;
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limitNum });

      const results = await User.aggregate(pipeline);

      sanitizedDonors = results.map((doc) =>
        sanitizeDonorSearchResult(doc, doc.distanceMeters / 1000)
      );
    } else {
      totalDocs = await User.countDocuments(matchCriteria);

      let sortOptions = { createdAt: -1 };
      if (sort === "recently_active") {
        sortOptions = { lastActiveAt: -1 };
      }

      const skip = (pageNum - 1) * limitNum;
      const results = await User.find(matchCriteria).sort(sortOptions).skip(skip).limit(limitNum);

      sanitizedDonors = results.map((doc) => sanitizeDonorSearchResult(doc, null));
    }

    const totalPages = Math.ceil(totalDocs / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: sanitizedDonors.length,
      total: totalDocs,
      page: pageNum,
      totalPages,
      donors: sanitizedDonors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get donor self-reported health questionnaire
 * @route   GET /api/donors/me/health-questionnaire
 * @access  Private (Donor only)
 */
export const getHealthQuestionnaire = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      healthQuestionnaire: req.user.healthQuestionnaire || {},
      disclaimer:
        "Preliminary self-reported information only. This does not certify medical eligibility. Formal clinical clearance must be conducted by certified medical/blood-bank personnel prior to donation.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update donor self-reported health questionnaire
 * @route   PUT /api/donors/me/health-questionnaire
 * @access  Private (Donor only)
 */
export const updateHealthQuestionnaire = async (req, res, next) => {
  try {
    const {
      currentWeight,
      medicalConditions,
      medications,
      recentIllnessOrFever,
      recentSurgery,
      previousDonation,
      lastDonationDate,
      additionalNotes,
    } = req.body;

    const parsedWeight =
      currentWeight !== undefined && currentWeight !== null && currentWeight !== ""
        ? Number(currentWeight)
        : null;

    if (parsedWeight !== null && (Number.isNaN(parsedWeight) || parsedWeight < 20 || parsedWeight > 300)) {
      return next(new AppError("Current weight must be a valid number between 20 kg and 300 kg.", 400));
    }

    const updatedQuestionnaire = {
      currentWeight: parsedWeight,
      medicalConditions: medicalConditions ? String(medicalConditions).trim() : "",
      medications: medications ? String(medications).trim() : "",
      recentIllnessOrFever: Boolean(recentIllnessOrFever),
      recentSurgery: Boolean(recentSurgery),
      previousDonation: Boolean(previousDonation),
      lastDonationDate: lastDonationDate ? String(lastDonationDate).trim() : "",
      additionalNotes: additionalNotes ? String(additionalNotes).trim() : "",
      updatedAt: new Date(),
    };

    req.user.healthQuestionnaire = updatedQuestionnaire;
    await req.user.save({ validateBeforeSave: false });

    logAuditEvent({
      actor: req.user._id,
      actorName: req.user.fullName,
      action: "UPDATE_HEALTH_QUESTIONNAIRE",
      category: "DONOR_ACTION",
      target: req.user._id.toString(),
      ipAddress: req.ip,
      severity: "NORMAL",
      details: `Donor updated health questionnaire. Weight: ${parsedWeight || "N/A"} kg.`,
    });

    res.status(200).json({
      success: true,
      message: "Health questionnaire updated successfully.",
      healthQuestionnaire: req.user.healthQuestionnaire,
      disclaimer:
        "Preliminary self-reported information only. This does not certify medical eligibility. Formal clinical clearance must be conducted by certified medical/blood-bank personnel prior to donation.",
    });
  } catch (error) {
    next(error);
  }
};
