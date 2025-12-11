// src/pages/Reservation.tsx
import { useState, useEffect, type JSX } from 'react';
import { Calendar, Clock, Search, Menu, ChevronDown, MapPin, Phone, Mail, AlertCircle, CheckCircle, XCircle, Filter, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../../components/CustomerSidebar';
import { fetchReservations } from '../../features/reservation/reservationthunks';
import { 
  selectReservations, 
  selectReservationsLoading, 
  selectReservationsError 
} from '../../features/reservation/reservationSelectors';
import type { AppDispatch } from '../../app/store';

// Define local types
interface AvailabilityDates {
  startDate: string;
  endDate: string;
}

interface AvailabilityResult {
  available: boolean;
  duration: number;
}

// Define the transformed reservation type
interface TransformedReservation {
  id: string;
  customer: string;
  email: string;
  phone: string;
  vehicle: string;
  vehicleImage: string;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: string;
  pickupLocation: string;
  duration: string;
}

const Reservation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const apiReservations = useSelector(selectReservations);
  const isLoading = useSelector(selectReservationsLoading);
  const error = useSelector(selectReservationsError);
  
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [checkingAvailability, setCheckingAvailability] = useState<boolean>(false);
  const [availabilityResult, setAvailabilityResult] = useState<AvailabilityResult | null>(null);
  const [availabilityDates, setAvailabilityDates] = useState<AvailabilityDates>({
    startDate: '',
    endDate: ''
  });
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Fetch reservations on component mount
  useEffect(() => {
    dispatch(fetchReservations());
  }, [dispatch]);

  // Transform API data to match component expectations
  const transformReservations = (apiRes: unknown): TransformedReservation[] => {
    // Handle case where apiRes is not an array
    if (!apiRes) {
      return [];
    }
    
    // Ensure apiRes is an array
    const reservationsArray = Array.isArray(apiRes) ? apiRes : [];
    
    return reservationsArray.map((res: any, index: number) => {
      // Use actual API data, fallback to defaults if missing
      const status = res.status || 'Upcoming';
      const startDate = res.startDate || new Date().toISOString().split('T')[0];
      const endDate = res.endDate || new Date().toISOString().split('T')[0];
      
      // Calculate duration based on dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: res.id || String(index + 1),
        customer: res.customerName || `Customer ${index + 1}`,
        email: res.email || 'customer@example.com',
        phone: res.phoneNumber || '+1 (555) 000-0000',
        vehicle: res.vehicleName || 'Vehicle',
        vehicleImage: res.vehicleImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&q=80',
        startDate: startDate,
        endDate: endDate,
        status: status,
        totalAmount: res.totalAmount || '$0',
        pickupLocation: res.pickupLocation || 'Location',
        duration: `${duration} days`
      };
    });
  };

  const reservations = transformReservations(apiReservations);

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "upcoming": return "bg-cyan-600 text-white";
      case "active": return "bg-blue-800 text-white";
      case "completed": return "bg-green-600 text-white";
      case "cancelled": return "bg-red-600 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status.toLowerCase()) {
      case "active": return <Clock className="w-4 h-4" />;
      case "upcoming": return <Calendar className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const checkAvailability = async (): Promise<void> => {
    if (!availabilityDates.startDate || !availabilityDates.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setCheckingAvailability(true);
    
    // Simulate API call - replace with actual availability check
    setTimeout(() => {
      const start = new Date(availabilityDates.startDate);
      const end = new Date(availabilityDates.endDate);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      // For demo purposes, assume availability is based on whether dates are in the future
      const isAvailable = start > new Date();
      
      setAvailabilityResult({
        available: isAvailable,
        duration: duration
      });
      setCheckingAvailability(false);
    }, 1500);
  };

  const filteredReservations = reservations.filter(res => {
    const matchesTab = selectedTab === 'all' || res.status.toLowerCase() === selectedTab;
    const matchesSearch = res.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/5 via-cyan-100/30 to-blue-500/10 flex">
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col lg:ml-74">

        {/* Navbar */}
        <nav className="fixed top-0 right-0 left-0 lg:left-74 z-40 bg-white/90 backdrop-blur-xl shadow-sm border-b border-blue-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              
              <div className="flex items-center">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden mr-3 p-2 rounded-lg bg-slate-100 hover:bg-slate-200"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                  <span className="text-gray-600">Dashboard</span>
                  <span className="text-gray-300">›</span>
                  <span className="text-gray-900 font-semibold">My Reservations</span>
                </div>
                <div className="sm:hidden">
                  <span className="text-gray-900 font-semibold text-base">Reservations</span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 cursor-pointer">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800">John Doe</p>
                  <p className="text-xs text-gray-500">Customer</p>
                </div>

                <div className="relative">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-800 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-semibold text-xs sm:text-sm">JD</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Filters Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setShowMobileFilters(false)}>
            <div 
              className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Filter Reservations</h3>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {['all', 'active', 'upcoming', 'completed', 'cancelled'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setSelectedTab(tab);
                      setShowMobileFilters(false);
                    }}
                    className={`w-full px-4 py-3 rounded-xl font-semibold transition-all text-left ${
                      selectedTab === tab
                        ? 'bg-gradient-to-r from-blue-800 to-cyan-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span className="float-right text-xs bg-white/25 px-2 py-1 rounded-full">
                      {tab === 'all' 
                        ? reservations.length 
                        : reservations.filter(r => r.status.toLowerCase() === tab).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto pt-16 sm:pt-20">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

            {/* Error State - Displayed on top */}
            {error && !isLoading && (
              <div className="bg-red-50 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-red-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-600 font-semibold text-sm sm:text-base">Error loading reservations</p>
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{error}</p>
                  </div>
                  <button
                    onClick={() => dispatch(fetchReservations())}
                    className="w-full sm:w-auto mt-2 sm:mt-0 bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90 text-white px-4 py-2 rounded-lg sm:rounded-xl font-semibold transition-all shadow-sm text-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Availability Section - Moved to top */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 lg:p-8 border border-blue-200 mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Check Vehicle Availability</h3>
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={availabilityDates.startDate}
                    onChange={(e) => setAvailabilityDates(prev => ({...prev, startDate: e.target.value}))}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={availabilityDates.endDate}
                    onChange={(e) => setAvailabilityDates(prev => ({...prev, endDate: e.target.value}))}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    min={availabilityDates.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                  <button
                    onClick={checkAvailability}
                    disabled={checkingAvailability}
                    className="w-full bg-gradient-to-r from-blue-800 to-cyan-500 hover:opacity-90 text-white px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl font-semibold transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {checkingAvailability ? 'Checking...' : 'Check Availability'}
                  </button>
                </div>
              </div>

              {availabilityResult && (
                <div className={`p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 ${
                  availabilityResult.available 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-start sm:items-center gap-3">
                    {availabilityResult.available ? (
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                    ) : (
                      <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                    )}
                    <div>
                      <h4 className={`text-base sm:text-lg font-bold ${
                        availabilityResult.available ? 'text-emerald-800' : 'text-amber-800'
                      }`}>
                        {availabilityResult.available 
                          ? `Vehicles are available for your ${availabilityResult.duration}-day reservation!` 
                          : 'No vehicles available for the selected dates'}
                      </h4>
                      <p className={`text-xs sm:text-sm mt-1 ${
                        availabilityResult.available ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {availabilityResult.available 
                          ? 'Contact our team to book your preferred vehicle.'
                          : 'Please try different dates or contact us for assistance.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border border-blue-200 mb-6 sm:mb-8">
              <div className="flex flex-col gap-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Search reservations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center justify-between">
                  <div className="hidden sm:flex gap-2 overflow-x-auto pb-2">
                    {['all', 'active', 'upcoming', 'completed', 'cancelled'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-semibold transition-all text-xs sm:text-sm whitespace-nowrap ${
                          selectedTab === tab
                            ? 'bg-gradient-to-r from-blue-800 to-cyan-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        <span className="ml-2 text-xs bg-white/25 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                          {tab === 'all' 
                            ? reservations.length 
                            : reservations.filter(r => r.status.toLowerCase() === tab).length}
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="sm:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="text-sm">Filter</span>
                    <span className="text-xs bg-white/25 px-1.5 py-0.5 rounded-full">
                      {selectedTab === 'all' 
                        ? reservations.length 
                        : reservations.filter(r => r.status.toLowerCase() === selectedTab).length}
                    </span>
                  </button>

                  {/* Selected Tab Display for Mobile */}
                  <div className="sm:hidden text-sm text-gray-700">
                    {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-8 sm:p-12 text-center border border-blue-200 mb-6 sm:mb-8">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
                <p className="text-base sm:text-xl text-gray-600 font-semibold">Loading reservations...</p>
              </div>
            )}

            {/* Count */}
            {!isLoading && (
              <div className="mb-4 sm:mb-6">
                <p className="text-sm sm:text-base text-gray-600">
                  Showing <span className="font-semibold text-gray-800">{filteredReservations.length}</span> reservations
                  {searchTerm && (
                    <> for "<span className="font-semibold text-gray-800">{searchTerm}</span>"</>
                  )}
                  {selectedTab !== 'all' && (
                    <> • Status: <span className="font-semibold text-gray-800">{selectedTab}</span></>
                  )}
                </p>
              </div>
            )}

            {/* Reservation Cards */}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {filteredReservations.map((reservation) => (
                  <div key={reservation.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden border border-blue-200 hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 sm:hover:-translate-y-1">
                    
                    {/* Mobile Compact View */}
                    <div className="sm:hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-base font-bold text-gray-800 truncate">{reservation.customer}</h3>
                              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(reservation.status)} shadow-md flex items-center gap-1 flex-shrink-0`}>
                                {getStatusIcon(reservation.status)}
                                <span className="hidden xs:inline">{reservation.status}</span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 font-semibold mb-1">{reservation.vehicle}</p>
                            <p className="text-xs text-gray-600 truncate">{reservation.email}</p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-xs text-gray-500 mb-1">Total</p>
                            <p className="text-lg font-bold bg-gradient-to-r from-blue-800 to-cyan-500 bg-clip-text text-transparent">
                              {reservation.totalAmount}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 mb-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Pick-up</p>
                              <p className="text-sm font-bold text-gray-800">{reservation.startDate}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Return</p>
                              <p className="text-sm font-bold text-gray-800">{reservation.endDate}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-4 h-4 text-blue-700" />
                            <span className="text-xs font-medium truncate">{reservation.pickupLocation}</span>
                          </div>
                          <div className="flex gap-2">
                            <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-semibold transition-all">
                              Details
                            </button>
                            <button className="text-xs bg-gradient-to-r from-blue-800 to-cyan-500 hover:opacity-90 text-white px-3 py-1.5 rounded-lg font-semibold transition-all shadow-md">
                              Manage
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop/Tablet View */}
                    <div className="hidden sm:flex flex-col lg:flex-row">
                      <div className="lg:w-64 xl:w-80 h-48 lg:h-auto relative overflow-hidden">
                        <img 
                          src={reservation.vehicleImage} 
                          alt={reservation.vehicle}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                      </div>
                      
                      <div className="flex-1 p-4 sm:p-6 lg:p-8">
                        <div className="flex flex-col sm:flex-row items-start justify-between mb-4 sm:mb-6">
                          <div className="flex-1 mb-4 sm:mb-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{reservation.customer}</h3>
                              <span className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold ${getStatusColor(reservation.status)} shadow-md flex items-center gap-2`}>
                                {getStatusIcon(reservation.status)}
                                {reservation.status}
                              </span>
                            </div>
                            <p className="text-lg sm:text-xl text-gray-700 font-semibold mb-1 sm:mb-2">{reservation.vehicle}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{reservation.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{reservation.phone}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-800 to-cyan-500 bg-clip-text text-transparent">
                              {reservation.totalAmount}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                            <div>
                              <p className="text-sm text-gray-600 mb-1 sm:mb-2 font-medium">Pick-up Date</p>
                              <p className="text-base sm:text-lg font-bold text-gray-800">{reservation.startDate}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1 sm:mb-2 font-medium">Return Date</p>
                              <p className="text-base sm:text-lg font-bold text-gray-800">{reservation.endDate}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1 sm:mb-2 font-medium">Duration</p>
                              <p className="text-base sm:text-lg font-bold text-gray-800">{reservation.duration}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                            <span className="text-sm sm:text-base font-medium">{reservation.pickupLocation}</span>
                          </div>
                          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                            <button className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all text-sm sm:text-base">
                              View Details
                            </button>
                            <button className="flex-1 sm:flex-none bg-gradient-to-r from-blue-800 to-cyan-500 hover:opacity-90 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all shadow-lg text-sm sm:text-base">
                              Manage Booking
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !error && filteredReservations.length === 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-8 sm:p-12 text-center border border-blue-200">
                <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-lg sm:text-xl text-gray-600 font-semibold">No reservations found</p>
                <p className="text-gray-500 text-sm sm:text-base mt-1 sm:mt-2">Try adjusting your filters or search terms</p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Reservation;