import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { requestService } from "../../services/requestService";
import { socketService } from "../../services/socketService";
import { useAuth } from "../../context/AuthContext";
import {
  Search,
  Filter,
  RefreshCw,
  BellRing,
  Inbox,
  CheckCircle2,
  Building2,
  MapPin,
  Clock,
  Eye,
  X,
  AlertCircle,
  Map as MapIcon,
  LayoutGrid,
  Columns,
  Radio,
} from "lucide-react";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import DonorRequestCard from "../../components/donor/DonorRequestCard";
import DonorRequestDetailModal from "../../components/donor/DonorRequestDetailModal";
import DonorDispatchMap from "../../components/maps/DonorDispatchMap";
import { getCityCoordinates } from "../../constants/indiaLocations";

export default function DonorRequestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");
  const [radiusFilter, setRadiusFilter] = useState(20);
  const [viewMode, setViewMode] = useState("SPLIT"); // LIST | MAP | SPLIT
  const [selectedRequestForModal, setSelectedRequestForModal] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // Compute donor coordinates
  const donorCityCoords = getCityCoordinates(user?.state, user?.city);
  const donorLocation = donorCityCoords
    ? [donorCityCoords.lat, donorCityCoords.lng]
    : user?.location?.coordinates && user.location.coordinates.length >= 2
    ? [user.location.coordinates[1], user.location.coordinates[0]]
    : [28.6139, 77.2090];

  const fetchAvailableRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (user?.bloodGroup) params.bloodGroup = user.bloodGroup;
      if (radiusFilter === 9999) {
        params.radius = "any";
      } else {
        params.radius = radiusFilter;
      }
      const res = await requestService.getAvailableRequests(params);
      if (res && res.requiresProfileCompletion) {
        setProfileIncomplete(true);
        setProfileMessage(res.message || "Date of Birth required to view active requisitions.");
      } else {
        setProfileIncomplete(false);
      }
      if (res && res.requests) {
        // Deduplicate incoming requests by unique request ID (_id / id)
        const seenIds = new Set();
        const uniqueRequests = res.requests.filter((r) => {
          const id = r.id || r._id;
          if (!id || seenIds.has(id)) return false;
          seenIds.add(id);
          return true;
        });

        // Ensure lat/lng are populated for mapping
        const mapped = uniqueRequests.map((r) => {
          let lat = r.lat;
          let lng = r.lng;
          if ((!lat || !lng) && r.location?.coordinates?.length >= 2) {
            lng = r.location.coordinates[0];
            lat = r.location.coordinates[1];
          }
          if ((!lat || !lng) && r.city) {
            const coords = getCityCoordinates(r.state, r.city);
            if (coords) {
              lat = coords.lat;
              lng = coords.lng;
            }
          }
          return { ...r, lat, lng };
        });
        setRequests(mapped);
      }
      const historyRes = await requestService.getDonorHistory();
      if (historyRes && historyRes.requests) {
        const activeAccepted = historyRes.requests.filter(
          (r) => r.status === "Donor Accepted" || r.status === "In Progress"
        );
        setAcceptedRequests(activeAccepted);
      }
    } catch (err) {
      console.error("Failed to fetch available requests for donor:", err);
    } finally {
      setIsLoading(false);
    }
  }, [radiusFilter, user?.bloodGroup, user?.state, user?.city]);

  useEffect(() => {
    fetchAvailableRequests();
  }, [fetchAvailableRequests]);

  // Real-Time Socket.IO Synchronization
  useEffect(() => {
    const handleNewRequest = (payload) => {
      // Re-fetch to get accurate server-computed distances and eligibility
      fetchAvailableRequests();
    };

    const handleUnavailable = (payload) => {
      const reqId = payload?.requestId || payload?.id;
      if (reqId) {
        setRequests((prev) => prev.filter((r) => (r.id || r._id) !== reqId));
      } else {
        fetchAvailableRequests();
      }
    };

    const handleReconnect = () => {
      fetchAvailableRequests();
    };

    socketService.on("bloodRequest:new", handleNewRequest);
    socketService.on("request:created", handleNewRequest);
    socketService.on("bloodRequest:emergency", handleNewRequest);
    socketService.on("bloodRequest:radius_expanded", handleNewRequest);
    socketService.on("request:radius_expanded", handleNewRequest);

    socketService.on("bloodRequest:unavailable", handleUnavailable);
    socketService.on("request:unavailable", handleUnavailable);
    socketService.on("bloodRequest:cancelled", handleUnavailable);
    socketService.on("bloodRequest:expired", handleUnavailable);
    socketService.on("bloodRequest:fulfilled", handleUnavailable);
    socketService.on("bloodRequest:statusChanged", fetchAvailableRequests);
    window.addEventListener("bloodward:reconnect", handleReconnect);

    return () => {
      socketService.off("bloodRequest:new", handleNewRequest);
      socketService.off("request:created", handleNewRequest);
      socketService.off("bloodRequest:emergency", handleNewRequest);
      socketService.off("bloodRequest:radius_expanded", handleNewRequest);
      socketService.off("request:radius_expanded", handleNewRequest);

      socketService.off("bloodRequest:unavailable", handleUnavailable);
      socketService.off("request:unavailable", handleUnavailable);
      socketService.off("bloodRequest:cancelled", handleUnavailable);
      socketService.off("bloodRequest:expired", handleUnavailable);
      socketService.off("bloodRequest:fulfilled", handleUnavailable);
      socketService.off("bloodRequest:statusChanged", fetchAvailableRequests);
      window.removeEventListener("bloodward:reconnect", handleReconnect);
    };
  }, [fetchAvailableRequests]);

  const isAvailable = user?.availability === "available" || user?.isAvailable;

  const handleMarkInProgress = async (requestId) => {
    try {
      const res = await requestService.markInProgress(requestId);
      if (res && res.request) {
        setFeedback("Request marked in progress.");
        setTimeout(() => setFeedback(""), 5000);
        fetchAvailableRequests();
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to update status to in-progress.");
      setTimeout(() => setErrorMessage(""), 5000);
      fetchAvailableRequests();
    }
  };

  const handleFulfill = async (requestId) => {
    try {
      const res = await requestService.fulfill(requestId);
      if (res && res.request) {
        setFeedback("Request marked as fulfilled successfully.");
        setTimeout(() => setFeedback(""), 5000);
        fetchAvailableRequests();
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to mark request as fulfilled.");
      setTimeout(() => setErrorMessage(""), 5000);
      fetchAvailableRequests();
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const res = await requestService.accept(requestId);
      if (res && res.request) {
        setFeedback("Successfully accepted blood request! Recipient contact unlocked.");
        setTimeout(() => setFeedback(""), 5000);
        // Immediately remove accepted request from available requests
        setRequests((prev) => prev.filter((r) => (r.id || r._id) !== requestId));
        fetchAvailableRequests();
      }
    } catch (err) {
      if (err?.code === "DISTANCE_LIMIT_EXCEEDED" || (typeof err?.distanceKm === "number" && err.distanceKm > (err.maxAllowedKm || 20))) {
        throw err;
      }
      if (err?.statusCode === 409 || err?.message?.includes("already been accepted") || err?.message?.includes("no longer active")) {
        setFeedback("This request was just accepted by another donor or has expired.");
      } else if (err?.statusCode === 403 || err?.message?.includes("Unavailable")) {
        setFeedback("Your donor status is currently set to Unavailable. Please toggle to Available.");
      } else {
        setFeedback(err.message || "Failed to accept request.");
      }
      setTimeout(() => setFeedback(""), 5000);
      fetchAvailableRequests();
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await requestService.reject(requestId);
      setRequests((prev) => prev.filter((r) => (r.id || r._id) !== requestId));
    } catch (err) {
      console.error("Failed to reject request:", err);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setUrgencyFilter("ALL");
    setRadiusFilter(20);
  };

  const filteredRequests = requests.filter((req) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchHospital = req.hospitalName?.toLowerCase().includes(q);
      const matchCity = req.city?.toLowerCase().includes(q);
      if (!matchHospital && !matchCity) return false;
    }
    if (urgencyFilter !== "ALL") {
      if (req.urgency !== urgencyFilter) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[11px] uppercase font-semibold">
            <Radio className="w-3 h-3 text-zinc-950 animate-pulse" />
            LIVE DISPATCH RADAR
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight flex items-center gap-2">
            Emergency Blood Requisitions
          </h1>
          <p className="text-xs text-zinc-600">
            Matching RBC compatibility for <strong className="text-zinc-950 font-bold">{user?.bloodGroup || "O+"}</strong> within your selected radius
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Segmented Switch */}
          <div className="bg-zinc-100 p-1 rounded-lg flex items-center border border-zinc-200">
            <button
              type="button"
              onClick={() => setViewMode("SPLIT")}
              className={`hidden md:flex px-2.5 py-1.5 rounded-md text-xs font-medium transition-all items-center gap-1.5 cursor-pointer ${
                viewMode === "SPLIT"
                  ? "bg-white text-zinc-950 shadow-2xs font-bold border border-zinc-200"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
              title="Split Screen View"
            >
              <Columns className="w-3.5 h-3.5" /> Split
            </button>
            <button
              type="button"
              onClick={() => setViewMode("MAP")}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "MAP"
                  ? "bg-white text-zinc-950 shadow-2xs font-bold border border-zinc-200"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
              title="Interactive Map View"
            >
              <MapIcon className="w-3.5 h-3.5" /> Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode("LIST")}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "LIST"
                  ? "bg-white text-zinc-950 shadow-2xs font-bold border border-zinc-200"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
              title="List View"
            >
              <LayoutGrid className="w-3.5 h-3.5" /> List
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAvailableRequests}
            className="shrink-0 font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Date of Birth Required Alert for Legacy Donors */}
      {(!user?.dateOfBirth || profileIncomplete) && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold block">Date of Birth Verification Required</span>
              <span className="text-amber-700 dark:text-amber-300">
                {profileMessage || "To receive and view active emergency blood requests, voluntary donors must verify that they are at least 18 years of age."}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/donor/profile")}
            className="shrink-0 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40"
          >
            Complete Profile Now
          </Button>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div className="p-3.5 rounded-lg bg-zinc-950 text-white text-xs flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" /> {feedback}
          </span>
          <button
            type="button"
            onClick={() => setFeedback("")}
            className="text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-950 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-zinc-950" /> {errorMessage}
          </span>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="text-zinc-600 hover:text-zinc-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Panel */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200 shadow-xs space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search hospital or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-zinc-200 bg-white text-zinc-950 placeholder-zinc-400 pl-9 pr-3 py-2 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 font-sans"
            />
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500">Urgency:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="font-medium text-zinc-900 bg-transparent outline-none cursor-pointer w-full text-xs"
            >
              <option value="ALL">All Urgency Levels</option>
              <option value="Emergency">Emergency Only (Today)</option>
              <option value="High">High Urgency</option>
              <option value="Normal">Normal Urgency</option>
            </select>
          </div>

          {/* Canonical Distance Filter: Strictly 5, 10, 20, 30, 50 KM */}
          <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500">Radius:</span>
            <select
              value={radiusFilter}
              onChange={(e) => setRadiusFilter(Number(e.target.value))}
              className="font-bold text-zinc-950 bg-transparent outline-none cursor-pointer w-full text-xs"
            >
              <option value={5}>Within 5 KM</option>
              <option value={10}>Within 10 KM</option>
              <option value={20}>Within 20 KM</option>
              <option value={30}>Within 30 KM</option>
              <option value={50}>Within 50 KM (Max Cap)</option>
              <option value={9999}>Any distance</option>
            </select>
          </div>
        </div>

        {(searchQuery || urgencyFilter !== "ALL" || radiusFilter !== 20) && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-100">
            <span className="text-zinc-500">
              Showing {filteredRequests.length} matching requests
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-zinc-950 font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ACCEPTED REQUESTS BANNER (If any active accepted) */}
      {acceptedRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-950 tracking-tight flex items-center gap-2 uppercase">
              <CheckCircle2 className="w-4 h-4 text-zinc-950" />
              Your Active Accepted Commitments ({acceptedRequests.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acceptedRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-5 rounded-xl border-2 border-zinc-950 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-zinc-950" />
                    <h4 className="font-bold text-zinc-950 text-sm">{req.hospitalName}</h4>
                  </div>
                  <StatusBadge status={req.status || "Donor Accepted"} urgency={req.urgency} />
                </div>

                <div className="text-xs text-zinc-700 space-y-1">
                  <p><strong>Required:</strong> {req.unitsNeeded} Unit(s) {req.bloodGroup}</p>
                  <p><strong>Hospital City:</strong> {req.city}</p>
                  <p className="text-zinc-950 font-bold">
                    Recipient coordination unlocked. Please proceed with donation.
                  </p>
                </div>

                {req.status === "Donor Accepted" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleMarkInProgress(req.id)}
                    className="w-full font-medium"
                  >
                    <Clock className="w-3.5 h-3.5 mr-1.5" /> Mark In Progress
                  </Button>
                )}

                {req.status === "In Progress" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleFulfill(req.id)}
                    className="w-full font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Mark as Fulfilled
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISPATCH EXPERIENCE: MAP, LIST, OR SPLIT VIEW */}
      {!isAvailable ? (
        <div className="bg-white p-8 rounded-xl border border-zinc-200 text-center space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
            <Inbox className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-zinc-950 text-base">Donor Availability Inactive</h3>
          <p className="text-xs text-zinc-600 max-w-md mx-auto">
            Your status is currently set to Unavailable. Toggle your status to "Available" in the navigation bar to accept incoming emergency blood requisitions.
          </p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-zinc-200 text-center space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
            <Inbox className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-zinc-950 text-base">No Matching Requests in Range</h3>
          <p className="text-xs text-zinc-600 max-w-md mx-auto">
            There are currently no active blood requests within {radiusFilter === 9999 ? "any distance" : `${radiusFilter} KM`} matching your blood group. New broadcasts will appear dynamically via Socket.IO.
          </p>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Reset Radius Filter
          </Button>
        </div>
      ) : viewMode === "MAP" ? (
        /* MAP ONLY VIEW */
        <div className="space-y-3">
          <DonorDispatchMap
            requests={filteredRequests}
            donorLocation={donorLocation}
            donorProfile={user}
            onSelectRequest={(r) => setSelectedRequestForModal(r)}
            onAcceptRequest={handleAccept}
            isDonorAvailable={isAvailable}
          />
        </div>
      ) : viewMode === "SPLIT" ? (
        /* SPLIT SCREEN VIEW: 50/50 ON DESKTOP */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 sticky top-4">
            <DonorDispatchMap
              requests={filteredRequests}
              donorLocation={donorLocation}
              donorProfile={user}
              onSelectRequest={(r) => setSelectedRequestForModal(r)}
              onAcceptRequest={handleAccept}
              isDonorAvailable={isAvailable}
            />
          </div>

          <div className="lg:col-span-5 space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-zinc-200">
              <span>Actionable Requisitions ({filteredRequests.length})</span>
              <span>Radius: {radiusFilter} KM</span>
            </div>
            {filteredRequests.map((req) => (
              <div key={req.id} className="flex flex-col space-y-1.5">
                <DonorRequestCard
                  request={req}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
                <button
                  type="button"
                  onClick={() => setSelectedRequestForModal(req)}
                  className="w-full py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-zinc-500" /> Inspect Request Details
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* LIST ONLY VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRequests.map((req) => (
            <div key={req.id} className="flex flex-col space-y-2">
              <DonorRequestCard
                request={req}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
              <button
                type="button"
                onClick={() => setSelectedRequestForModal(req)}
                className="w-full py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5 text-zinc-500" /> Inspect Request Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* REQUEST DETAIL MODAL */}
      <DonorRequestDetailModal
        request={selectedRequestForModal}
        isOpen={!!selectedRequestForModal}
        onClose={() => setSelectedRequestForModal(null)}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </div>
  );
}
