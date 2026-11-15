import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { socketService } from "../../services/socketService";
import {
  Search,
  MapPin,
  RefreshCw,
  Inbox,
  ArrowUpDown,
  CheckCircle2,
  Map as MapIcon,
  LayoutGrid,
  Columns,
  AlertCircle,
  Radio,
} from "lucide-react";
import Button from "../../components/common/Button";
import RecipientDonorCard from "../../components/recipient/RecipientDonorCard";
import RecipientDonorDetailModal from "../../components/recipient/RecipientDonorDetailModal";
import DonorSearchMap from "../../components/maps/DonorSearchMap";
import { BLOOD_GROUPS } from "../../constants/theme";
import { getCityCoordinates } from "../../constants/indiaLocations";
import api from "../../services/api";

export default function RecipientDonorSearchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [donors, setDonors] = useState([]);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [distanceRadius, setDistanceRadius] = useState(20);
  const [availableOnly, setAvailableOnly] = useState(true);
  const [sortBy, setSortBy] = useState("NEAREST");
  const [viewMode, setViewMode] = useState("SPLIT"); // GRID | MAP | SPLIT
  const [selectedDonorForModal, setSelectedDonorForModal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const recipientLocation = getCityCoordinates(user?.state, user?.city);
  const hasProfileLocation = !!(user?.city && recipientLocation);

  const fetchDonors = useCallback(async () => {
    if (distanceRadius !== "any" && !hasProfileLocation) {
      setDonors([]);
      setSearchError(null);
      return;
    }

    setIsLoading(true);
    setSearchError(null);

    try {
      const params = {};
      if (selectedBloodGroup !== "ALL") params.bloodGroup = selectedBloodGroup;

      if (distanceRadius === "any") {
        params.radius = "any";
      } else {
        params.radius = distanceRadius;
        params.latitude = recipientLocation.lat;
        params.longitude = recipientLocation.lng;
      }

      if (sortBy === "NEAREST") params.sort = "nearest";
      if (sortBy === "FARTHEST") params.sort = "farthest";
      if (sortBy === "RECENT") params.sort = "recently_active";

      const res = await api.get("/donors/search", { params });
      if (res && res.data && Array.isArray(res.data.donors)) {
        const mapped = res.data.donors.map((d) => {
          const donorCoords = getCityCoordinates(d.state, d.city);
          return {
            id: d.id || d._id,
            name: d.fullName,
            fullName: d.fullName,
            bloodGroup: d.bloodGroup,
            city: d.city || "",
            state: d.state || "",
            distanceKm: d.distanceKm,
            isAvailable: d.availability === "available",
            availability: d.availability,
            lastActiveAt: d.lastActiveAt,
            lat: donorCoords ? donorCoords.lat : null,
            lng: donorCoords ? donorCoords.lng : null,
          };
        });
        setDonors(mapped);
      }
    } catch (err) {
      console.error("Donor search API failed:", err);
      const message =
        err.response?.data?.message || err.message || "Search request failed. Please try again.";
      setSearchError(message);
      setDonors([]);
    } finally {
      setIsLoading(false);
    }
  }, [distanceRadius, hasProfileLocation, recipientLocation, selectedBloodGroup, sortBy]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  // Real-Time Socket.IO Synchronization for Donor Availability
  useEffect(() => {
    const handleDonorAvailability = (payload) => {
      const donorId = payload?.donorId || payload?.id;
      if (!donorId) return;

      const newIsAvailable =
        payload.isAvailable !== undefined
          ? payload.isAvailable
          : payload.availability === "available";

      setDonors((prev) =>
        prev.map((d) =>
          d.id === donorId
            ? {
                ...d,
                isAvailable: newIsAvailable,
                availability: payload.availability || (newIsAvailable ? "available" : "not_available"),
              }
            : d
        )
      );
    };

    const handleReconnect = () => {
      fetchDonors();
    };

    socketService.on("donor:availabilityChanged", handleDonorAvailability);
    socketService.on("donor:availability_updated", handleDonorAvailability);
    window.addEventListener("bloodward:reconnect", handleReconnect);

    return () => {
      socketService.off("donor:availabilityChanged", handleDonorAvailability);
      socketService.off("donor:availability_updated", handleDonorAvailability);
      window.removeEventListener("bloodward:reconnect", handleReconnect);
    };
  }, [fetchDonors]);

  const handleReset = () => {
    setSelectedBloodGroup("ALL");
    setSearchQuery("");
    setDistanceRadius(20);
    setAvailableOnly(true);
    setSortBy("NEAREST");
    setSearchError(null);
  };

  const handleRefresh = () => {
    fetchDonors();
  };

  const filteredDonors = donors.filter((d) => {
    if (availableOnly && !d.isAvailable) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = d.name?.toLowerCase().includes(q);
      const matchCity = d.city?.toLowerCase().includes(q);
      if (!matchName && !matchCity) return false;
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
            RECIPIENT DISCOVERY RADAR
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight flex items-center gap-2">
            Discover Nearby Blood Donors
          </h1>
          <p className="text-xs text-zinc-600">
            Real-time directory of verified voluntary blood donors bounded by canonical distance presets
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="bg-zinc-100 p-1 rounded-lg flex items-center border border-zinc-200">
            <button
              type="button"
              onClick={() => setViewMode("SPLIT")}
              className={`hidden md:flex px-2.5 py-1.5 rounded-md text-xs font-medium transition-all items-center gap-1.5 cursor-pointer ${
                viewMode === "SPLIT"
                  ? "bg-white text-zinc-950 shadow-2xs font-bold border border-zinc-200"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
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
            >
              <MapIcon className="w-3.5 h-3.5" /> Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode("GRID")}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "GRID"
                  ? "bg-white text-zinc-950 shadow-2xs font-bold border border-zinc-200"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Grid
            </button>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 cursor-pointer shadow-xs transition-colors"
            title="Refresh search"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* SEARCH CONTROL BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200 shadow-xs space-y-4">
        {/* Blood Group Filter Chips */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-800 uppercase tracking-wider block">
            Filter by Blood Group:
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedBloodGroup("ALL")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                selectedBloodGroup === "ALL"
                  ? "bg-zinc-950 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
              }`}
            >
              All Blood Groups
            </button>
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => setSelectedBloodGroup(bg)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  selectedBloodGroup === bg
                    ? "bg-zinc-950 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Input Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-zinc-200 bg-white text-zinc-950 placeholder-zinc-400 pl-9 pr-3 py-2 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 font-sans"
            />
          </div>

          {/* Canonical Distance Presets strictly: [5, 10, 20, 30, 50] */}
          <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500">Radius:</span>
            <select
              value={distanceRadius}
              onChange={(e) => setDistanceRadius(e.target.value === "any" ? "any" : Number(e.target.value))}
              className="font-bold text-zinc-950 bg-transparent outline-none cursor-pointer w-full text-xs"
            >
              <option value={5}>Within 5 KM</option>
              <option value={10}>Within 10 KM</option>
              <option value={20}>Within 20 KM</option>
              <option value={30}>Within 30 KM</option>
              <option value={50}>Within 50 KM (Max Cap)</option>
              <option value="any">Any distance</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="font-medium text-zinc-900 bg-transparent outline-none cursor-pointer w-full text-xs"
            >
              <option value="NEAREST">Nearest Proximity</option>
              <option value="FARTHEST">Farthest First</option>
              <option value="RECENT">Recently Active</option>
            </select>
          </div>

          {/* Available Only Checkbox */}
          <label className="flex items-center justify-between bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-800 cursor-pointer">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" /> Available Only
            </span>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded text-zinc-950 focus:ring-zinc-950 w-3.5 h-3.5 cursor-pointer"
            />
          </label>
        </div>

        {/* Applied Filters Reset Bar */}
        {(selectedBloodGroup !== "ALL" || searchQuery || distanceRadius !== 20 || !availableOnly || sortBy !== "NEAREST") && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-100">
            <span className="text-zinc-500">
              Showing {filteredDonors.length} matching donors
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-zinc-950 font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Location Required Banner */}
      {!hasProfileLocation && distanceRadius !== "any" && (
        <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-zinc-800 shrink-0" />
            <div>
              <span className="font-bold block text-zinc-950">
                Location Coordinates Required for Radius Search
              </span>
              <span className="text-zinc-600">
                Your recipient profile does not have a recognized state/city set. Set your profile location or switch to "Any distance".
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => navigate("/recipient/profile")}>
              Update Profile Location
            </Button>
            <Button variant="primary" size="sm" onClick={() => setDistanceRadius("any")}>
              Search Any Distance
            </Button>
          </div>
        </div>
      )}

      {/* Search Error Banner */}
      {searchError && (
        <div className="p-3.5 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-950 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-zinc-950" /> {searchError}
          </span>
          <Button variant="outline" size="sm" onClick={fetchDonors}>
            Try Again
          </Button>
        </div>
      )}

      {/* VIEW MODES: MAP, GRID, OR SPLIT */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-xl border border-zinc-200 text-center space-y-3 shadow-xs">
          <RefreshCw className="w-6 h-6 text-zinc-400 mx-auto animate-spin" />
          <p className="text-xs text-zinc-600">Searching nearby verified donors...</p>
        </div>
      ) : filteredDonors.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-zinc-200 text-center space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
            <Inbox className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-zinc-950 text-base">No matching donors found</h3>
          <p className="text-xs text-zinc-600 max-w-md mx-auto">
            Try expanding your search radius to 30 KM or 50 KM, selecting all blood groups, or toggling "Any distance".
          </p>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset Search Filters
          </Button>
        </div>
      ) : viewMode === "MAP" ? (
        /* MAP ONLY VIEW */
        <div className="space-y-3">
          <DonorSearchMap
            donors={filteredDonors}
            radiusKm={distanceRadius === "any" ? 9999 : distanceRadius}
            onSelectDonor={(d) => setSelectedDonorForModal(d)}
            center={recipientLocation ? [recipientLocation.lat, recipientLocation.lng] : [28.6139, 77.2090]}
            onRadiusChange={(r) => setDistanceRadius(r)}
          />
        </div>
      ) : viewMode === "SPLIT" ? (
        /* SPLIT SCREEN VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 sticky top-4">
            <DonorSearchMap
              donors={filteredDonors}
              radiusKm={distanceRadius === "any" ? 9999 : distanceRadius}
              onSelectDonor={(d) => setSelectedDonorForModal(d)}
              center={recipientLocation ? [recipientLocation.lat, recipientLocation.lng] : [28.6139, 77.2090]}
              onRadiusChange={(r) => setDistanceRadius(r)}
            />
          </div>

          <div className="lg:col-span-5 space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
            <div className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-zinc-200">
              <span>Matching Donors ({filteredDonors.length})</span>
              <span>Radius: {distanceRadius === "any" ? "Any" : `${distanceRadius} KM`}</span>
            </div>
            {filteredDonors.map((donor) => (
              <RecipientDonorCard
                key={donor.id}
                donor={donor}
                onViewDetails={(d) => setSelectedDonorForModal(d)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* GRID ONLY VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDonors.map((donor) => (
            <RecipientDonorCard
              key={donor.id}
              donor={donor}
              onViewDetails={(d) => setSelectedDonorForModal(d)}
            />
          ))}
        </div>
      )}

      {/* DONOR DETAIL MODAL */}
      <RecipientDonorDetailModal
        donor={selectedDonorForModal}
        isOpen={!!selectedDonorForModal}
        onClose={() => setSelectedDonorForModal(null)}
      />
    </div>
  );
}
