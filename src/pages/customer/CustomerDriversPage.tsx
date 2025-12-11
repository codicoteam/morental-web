// Updated Drivers component with modal centered
import { useState, useEffect } from 'react';
import { 
  MapPin, Search, Menu, User, Calendar, X, Loader2, 
  Star, Clock, Globe, Shield, CheckCircle,
  Award, Briefcase
} from 'lucide-react';
import Sidebar from '../../components/CustomerSidebar';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchDrivers } from '../../features/driver/driverthunks'; 
import { selectDrivers, selectLoading, selectError } from '../../features/driver/driverSelectors';

// Define Booking interface
interface Booking {
  id: number;
  driverName: string;
  price: number;
  location: string;
  date: string;
  driverId: string;
  hours: number;
  totalAmount: number;
  status: 'pending' | 'confirmed';
}

// Define the Driver interface to match Redux state
interface Driver {
  _id: string;
  user_id: {
    _id: string;
    full_name: string;
  };
  display_name: string;
  base_city: string;
  base_region: string;
  base_country: string;
  hourly_rate: number;
  bio: string;
  years_experience: number;
  languages: string[];
  identity_document?: {
    type: string;
    imageUrl: string;
  };
  driver_license?: {
    number: string;
    imageUrl: string;
    country: string;
    class: string;
    expires_at: string;
    verified: boolean;
  };
  status: string;
  is_available: boolean;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

// Type guard to check if driver has the required properties
const isDriver = (driver: any): driver is Driver => {
  return (
    driver &&
    typeof driver === 'object' &&
    '_id' in driver &&
    'user_id' in driver &&
    'display_name' in driver &&
    'base_city' in driver
  );
};

interface BookingDrawerData {
  driver: Driver;
  hours: number;
  totalAmount: number;
  bookingDate: string;
  specialInstructions: string;
}

const Drivers: React.FC = () => {
  const dispatch = useAppDispatch();
  const drivers = useAppSelector(selectDrivers) as unknown as Driver[] || [];
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showBookingDrawer, setShowBookingDrawer] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [bookingDrawerData, setBookingDrawerData] = useState<BookingDrawerData | null>(null);

  // Get unique locations from drivers data
  const uniqueLocations = drivers && drivers.length > 0 
    ? ['All', ...new Set(drivers.map(driver => driver.base_city).filter(Boolean) as string[])]
    : ['All', 'Harare', 'Mutare', 'Bulawayo', 'Gweru'];

  useEffect(() => {
    dispatch(fetchDrivers());
  }, [dispatch]);

  // Initialize booking drawer data when a driver is selected
  useEffect(() => {
    if (selectedDriver) {
      setBookingDrawerData({
        driver: selectedDriver,
        hours: 1,
        totalAmount: selectedDriver.hourly_rate,
        bookingDate: new Date().toISOString().split('T')[0],
        specialInstructions: ''
      });
    }
  }, [selectedDriver]);

  const filteredDrivers = drivers ? drivers.filter(driver => {
    if (!isDriver(driver)) return false;
    
    const matchSearch = driver.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.base_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.user_id.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLocation = selectedLocation === 'All' ? true : driver.base_city === selectedLocation;
    const isAvailable = driver.is_available;

    return matchSearch && matchLocation && isAvailable;
  }) : [];

  const handleBookDriver = (driver: Driver) => {
    if (!isDriver(driver)) {
      console.error('Invalid driver object:', driver);
      return;
    }
    
    setSelectedDriver(driver);
    setShowBookingDrawer(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedDriver || !bookingDrawerData) return;

    const newBooking: Booking = {
      id: Date.now(),
      driverName: selectedDriver.user_id.full_name,
      price: selectedDriver.hourly_rate,
      location: selectedDriver.base_city,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      driverId: selectedDriver._id,
      hours: bookingDrawerData.hours,
      totalAmount: bookingDrawerData.totalAmount,
      status: 'confirmed'
    };

    setBookings([...bookings, newBooking]);
    setShowBookingDrawer(false);
    setSelectedDriver(null);
    setBookingDrawerData(null);
    
    // Show success message
    alert(`✅ Booking confirmed! ${selectedDriver.user_id.full_name} has been booked for ${bookingDrawerData.hours} hour(s) at $${bookingDrawerData.totalAmount}`);
  };

  const handleHoursChange = (hours: number) => {
    if (!bookingDrawerData || !selectedDriver) return;
    
    if (hours < 1) hours = 1;
    if (hours > 24) hours = 24;
    
    const totalAmount = hours * selectedDriver.hourly_rate;
    setBookingDrawerData({
      ...bookingDrawerData,
      hours,
      totalAmount
    });
  };

  const getDriverImage = (driver: Driver) => {
    if (!isDriver(driver)) {
      return `https://ui-avatars.com/api/?name=Driver&background=3b82f6&color=fff&size=256`;
    }
    
    // Use identity document image or license image if available
    return driver.identity_document?.imageUrl || 
           driver.driver_license?.imageUrl || 
           `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.user_id.full_name)}&background=3b82f6&color=fff&size=256`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-100 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Drivers</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => dispatch(fetchDrivers())}
            className="w-full bg-gradient-to-r from-blue-800 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-100 flex">
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col lg:ml-74 relative">
        <nav className="fixed top-0 right-0 left-0 lg:left-74 z-40 bg-white/90 backdrop-blur-xl shadow-sm border-b border-blue-200 h-20">
          <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mr-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            <div className="text-gray-700 font-semibold">Driver Booking System</div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 hidden md:block">
                {drivers.length} drivers available
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-500 flex items-center justify-center text-white font-bold">
                JD
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto mt-20 p-4 md:p-8 max-w-7xl mx-auto w-full relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-40">
              <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="mt-3 text-gray-700 font-medium">Loading drivers…</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Available Drivers</h1>
              <p className="text-gray-600 mt-1">
                {drivers.length} driver{drivers.length !== 1 ? 's' : ''}
                {filteredDrivers.length !== drivers.length && (
                  <span className="ml-2 text-blue-600 font-medium">
                    ({filteredDrivers.length} matching your search)
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={() => setShowBookingsModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-800 to-cyan-600 text-white px-5 md:px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all duration-300 font-semibold w-full sm:w-auto justify-center"
            >
              <User className="w-5 h-5" />
              My Bookings
              {bookings.length > 0 && (
                <span className="bg-white text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold ml-1">
                  {bookings.length}
                </span>
              )}
            </button>
          </div>

          <div className="bg-white shadow-xl border border-blue-200 p-4 md:p-6 rounded-2xl mb-8 md:mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search drivers by name or location..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="py-3 px-4 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Showing {filteredDrivers.length} of {drivers.length} drivers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>{filteredDrivers.filter(d => d.is_available).length} available now</span>
              </div>
            </div>
          </div>

          {filteredDrivers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-blue-200">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No drivers found</h3>
              <p className="text-gray-500">Try changing your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrivers.map((driver) => (
                <div 
                  key={driver._id} 
                  className="bg-white rounded-2xl shadow-xl border border-blue-200 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-48 w-full overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50">
                    <img 
                      src={getDriverImage(driver)} 
                      alt={driver.user_id.full_name}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.user_id.full_name)}&background=3b82f6&color=fff&size=256`;
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-blue-800 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {driver.status === 'approved' ? 'Verified' : driver.status}
                    </div>
                    {!driver.is_available && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Unavailable
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 truncate">{driver.user_id.full_name}</h3>
                        <p className="text-sm text-gray-500">{driver.display_name}</p>
                      </div>
                      {driver.is_available && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Available
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 flex items-center gap-2 mt-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" /> 
                      <span className="truncate">{driver.base_city}, {driver.base_country}</span>
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-gray-500 text-sm flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {driver.years_experience} years exp
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          {driver.rating_average.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">({driver.rating_count})</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {driver.languages.slice(0, 2).map((lang, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            <Globe className="w-3 h-3 inline mr-1" />
                            {lang}
                          </span>
                        ))}
                        {driver.languages.length > 2 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            +{driver.languages.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-800 to-cyan-500 bg-clip-text text-transparent">
                          ${driver.hourly_rate}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">/hour</span>
                      </div>
                      <button
                        onClick={() => handleBookDriver(driver)}
                        disabled={!driver.is_available}
                        className={`px-4 md:px-5 py-2 rounded-xl font-semibold shadow transition-all ${
                          driver.is_available 
                            ? 'bg-gradient-to-r from-blue-800 to-cyan-500 text-white hover:opacity-90' 
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {driver.is_available ? 'Book Now' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Booking Drawer - No blur overlay */}
          {showBookingDrawer && selectedDriver && bookingDrawerData && (
            <div className="fixed inset-y-0 right-0 z-50 w-full md:w-2/3 lg:w-1/2 xl:w-1/3 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
              <div className="h-full flex flex-col">
                {/* Drawer Header */}
                <div className="bg-gradient-to-r from-blue-800 to-cyan-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Confirm Booking</h2>
                      <p className="text-blue-100 mt-1">
                        Complete your booking with {selectedDriver.user_id.full_name}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowBookingDrawer(false);
                        setSelectedDriver(null);
                        setBookingDrawerData(null);
                      }}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={getDriverImage(selectedDriver)} 
                          alt={selectedDriver.user_id.full_name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedDriver.user_id.full_name}</h3>
                        <p className="text-gray-600">{selectedDriver.display_name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{selectedDriver.base_city}, {selectedDriver.base_country}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver Details */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-700">Experience</span>
                      </div>
                      <p className="text-gray-600">{selectedDriver.years_experience} years</p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold text-gray-700">Rating</span>
                      </div>
                      <p className="text-gray-600">{selectedDriver.rating_average.toFixed(1)} ({selectedDriver.rating_count} reviews)</p>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Languages Spoken</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDriver.languages.map((lang, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Driver Bio */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">About Driver</h4>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-xl text-sm">{selectedDriver.bio}</p>
                  </div>

                  {/* Booking Details */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hours Required
                        </label>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleHoursChange(bookingDrawerData.hours - 1)}
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                          >
                            -
                          </button>
                          <div className="flex-1 text-center">
                            <span className="text-2xl font-bold text-gray-900">{bookingDrawerData.hours}</span>
                            <span className="text-gray-600 ml-2">hour(s)</span>
                          </div>
                          <button
                            onClick={() => handleHoursChange(bookingDrawerData.hours + 1)}
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Booking Date
                        </label>
                        <input
                          type="date"
                          value={bookingDrawerData.bookingDate}
                          onChange={(e) => setBookingDrawerData({
                            ...bookingDrawerData,
                            bookingDate: e.target.value
                          })}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Special Instructions (Optional)
                        </label>
                        <textarea
                          value={bookingDrawerData.specialInstructions}
                          onChange={(e) => setBookingDrawerData({
                            ...bookingDrawerData,
                            specialInstructions: e.target.value
                          })}
                          placeholder="Any special requirements or instructions..."
                          rows={2}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Pricing Summary */}
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h5 className="font-semibold text-gray-700 mb-3">Pricing Summary</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hourly Rate</span>
                            <span className="font-medium">${selectedDriver.hourly_rate}/hr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hours</span>
                            <span className="font-medium">{bookingDrawerData.hours}</span>
                          </div>
                          <div className="border-t border-gray-200 pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                              <span className="text-2xl font-bold text-blue-800">
                                ${bookingDrawerData.totalAmount}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setShowBookingDrawer(false);
                        setSelectedDriver(null);
                        setBookingDrawerData(null);
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmBooking}
                      className="px-6 py-3 bg-gradient-to-r from-blue-800 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transition-opacity flex-1 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Confirm Booking
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    By confirming, you agree to our terms and conditions
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Modal */}
          {showBookingsModal && (
            <>
              <div className="fixed inset-0 z-50 lg:left-74 bg-black/50 backdrop-blur-sm"></div>
              
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:left-74">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-up">
                  
                  <div className="bg-gradient-to-r from-blue-800 to-cyan-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">My Bookings</h2>
                        <p className="text-blue-100 mt-1">
                          {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowBookingsModal(false)}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {bookings.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                          <Calendar className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h3>
                        <p className="text-gray-500">Book a driver to see your bookings here!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map((booking) => {
                          const driver = drivers.find(d => d._id === booking.driverId);
                          const driverImage = driver ? getDriverImage(driver) : 
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.driverName)}&background=3b82f6&color=fff`;
                          
                          return (
                            <div key={booking.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                  <img 
                                    src={driverImage} 
                                    alt={booking.driverName}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="text-lg font-semibold text-gray-900 truncate">
                                        {booking.driverName}
                                      </h4>
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-4 h-4" />
                                          {booking.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-4 h-4" />
                                          {booking.hours} hour(s)
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-4 h-4" />
                                          {booking.date}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-blue-800">
                                        ${booking.totalAmount}
                                      </div>
                                      <div className={`text-xs font-medium px-2 py-1 rounded-full mt-1 ${
                                        booking.status === 'confirmed' 
                                          ? 'bg-green-50 text-green-600'
                                          : 'bg-yellow-50 text-yellow-600'
                                      }`}>
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {bookings.length > 0 && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-gray-700 font-semibold">Total Bookings:</span>
                          <span className="ml-2 text-blue-800 font-bold">{bookings.length}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-700 font-semibold">Total Amount:</span>
                          <span className="ml-2 text-2xl font-bold text-blue-800">
                            ${bookings.reduce((total, b) => total + b.totalAmount, 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Add CSS animation for the modal */}
      <style>{`
        @keyframes scale-up {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Drivers;