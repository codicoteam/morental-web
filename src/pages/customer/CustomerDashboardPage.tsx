import { useState, useEffect } from 'react';
import { 
  ChevronRight, MapPin, 
  Menu, ChevronDown, Bell, 
  Users, Car as CarIcon, Calendar,
  Clock, CheckCircle, AlertCircle,
  Star, Briefcase, Globe, 
  X, Award, CheckCircle as CheckCircleIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/CustomerSidebar';
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchVehicles } from '../../features/vehicles/vehiclesThunks';
import { selectVehicles, selectVehiclesLoading, selectVehiclesError } from '../../features/vehicles/vehiclesSelectors';
import { fetchDrivers } from '../../features/driver/driverthunks';
import { selectDrivers, selectLoading, selectError } from '../../features/driver/driverSelectors';

interface Branch {
  _id: string;
  name: string;
}

interface VehicleMetadata {
  seats?: number;
  doors?: number;
  features?: string[];
}

interface Vehicle {
  _id: string;
  plate_number: string;
  color: string;
  status: string;
  availability_state: string;
  photos: string[];
  metadata: VehicleMetadata;
}

interface Pricing {
  _id: string;
  branch_id: Branch;
  vehicle_class: string;
  vehicle_id: Vehicle;
  currency: string;
  daily_rate: { $numberDecimal: string };
  weekly_rate: { $numberDecimal: string };
  name: string;
  active: boolean;
}

interface ApiResponse {
  success: boolean;
  data: {
    items: Pricing[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

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

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface BookingDrawerData {
  driver: Driver;
  hours: number;
  totalAmount: number;
  bookingDate: string;
  specialInstructions: string;
}

const Dashboardy = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showBookingDrawer, setShowBookingDrawer] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingDrawerData, setBookingDrawerData] = useState<BookingDrawerData | null>(null);
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const vehicles = useAppSelector(selectVehicles);
  const vehiclesLoading = useAppSelector(selectVehiclesLoading);
  const vehiclesError = useAppSelector(selectVehiclesError);
  
  const drivers = useAppSelector(selectDrivers) as unknown as Driver[] || [];
  const driversLoading = useAppSelector(selectLoading);
  const driversError = useAppSelector(selectError);

  useEffect(() => {
    dispatch(fetchVehicles());
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

  const handleBookNow = (pricingInfo: Pricing) => {
    navigate(`/book/${pricingInfo._id}`);
  };

  const handleBookDriver = (driver: Driver) => {
    if (!driver.is_available) return;
    
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

  const viewAllVehicles = () => {
    navigate('/dashboardy');
  };

  const viewAllDrivers = () => {
    navigate('/driver');
  };

  const parseDecimal = (decimalObj: { $numberDecimal: string }): string => {
    if (!decimalObj || !decimalObj.$numberDecimal) return '0.00';
    return parseFloat(decimalObj.$numberDecimal).toFixed(2);
  };

  const getPricingArray = (): Pricing[] => {
    if (!vehicles) return [];
    
    if (typeof vehicles === 'object' && vehicles !== null) {
      if ('data' in vehicles && typeof vehicles.data === 'object' && vehicles.data !== null) {
        const apiResponse = vehicles as unknown as ApiResponse;
        if ('items' in apiResponse.data && Array.isArray(apiResponse.data.items)) {
          return apiResponse.data.items;
        }
      }
      
      if (Array.isArray(vehicles)) {
        return vehicles as unknown as Pricing[];
      }
    }
    
    return [];
  };

  const getStatusColor = (availabilityState: string) => {
    switch (availabilityState) {
      case "available": return "bg-green-100 text-green-800";
      case "reserved": return "bg-blue-100 text-blue-800";
      case "in_use": return "bg-indigo-100 text-indigo-800";
      case "maintenance": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplayText = (availabilityState: string) => {
    switch (availabilityState) {
      case "available": return "Available";
      case "reserved": return "Reserved";
      case "in_use": return "In Use";
      case "maintenance": return "Maintenance";
      default: return "Unavailable";
    }
  };

  const getDriverImage = (driver: Driver) => {
    if (!driver) {
      return `https://ui-avatars.com/api/?name=Driver&background=3b82f6&color=fff&size=256`;
    }
    
    return driver.identity_document?.imageUrl || 
           driver.driver_license?.imageUrl || 
           `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.user_id.full_name)}&background=3b82f6&color=fff&size=256`;
  };

  const getDriverStatusColor = (status: string) => {
    if (status === 'approved') {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getDriverStatusText = (driver: Driver) => {
    if (driver.status === 'approved' && driver.is_available) {
      return 'Available';
    } else if (!driver.is_available) {
      return 'Unavailable';
    }
    return driver.status.charAt(0).toUpperCase() + driver.status.slice(1);
  };

  const getBookingStatusColor = (status: 'upcoming' | 'active' | 'completed') => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pricingArray = getPricingArray();
  const recentVehicles = pricingArray.slice(0, 3);
  
  // Get only 3 available drivers for the dashboard
  const recentDrivers = drivers
    .filter(driver => driver.is_available && driver.status === 'approved')
    .slice(0, 3);

  const dashboardBookings = [
    {
      id: 1,
      vehicle: "BMW 5 Series",
      driver: "Michael Rodriguez",
      date: "2024-01-15",
      time: "10:00 AM",
      status: "upcoming" as const
    },
    {
      id: 2,
      vehicle: "Mercedes E-Class",
      driver: "Sarah Johnson",
      date: "2024-01-14",
      time: "2:00 PM",
      status: "active" as const
    },
    {
      id: 3,
      vehicle: "Audi A6",
      driver: "David Chen",
      date: "2024-01-13",
      time: "9:00 AM",
      status: "completed" as const
    }
  ];

  const notifications: NotificationItem[] = [
    {
      id: 1,
      title: "Booking Confirmed",
      message: "Your BMW 5 Series booking has been confirmed",
      time: "5 min ago",
      read: false
    },
    {
      id: 2,
      title: "Driver Assigned",
      message: "Michael Rodriguez has been assigned to your trip",
      time: "1 hour ago",
      read: false
    },
    {
      id: 3,
      title: "Payment Received",
      message: "Payment of $450 has been processed successfully",
      time: "2 hours ago",
      read: true
    }
  ];

  const stats = {
    totalTrips: 24,
    activeBookings: 2,
    availableDrivers: recentDrivers.length,
    totalSpent: 4250
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/5 via-cyan-100/30 to-blue-500/10 flex">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-74">
        {/* NAVBAR */}
        <nav className="fixed top-0 right-0 left-0 lg:left-74 z-40 bg-white/90 backdrop-blur-xl shadow-sm border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-center justify-between h-20">
              {/* LEFT */}
              <div className="flex items-center">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden mr-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-600">Dashboard</span>
                  <span className="text-gray-300">›</span>
                  <span className="text-gray-900 font-semibold">Customer Dashboard</span>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200 flex justify-between">
                        <h3 className="font-bold text-gray-800">Notifications</h3>
                        <span className="text-sm text-gray-500">{unreadNotifications} unread</span>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id}
                            className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                !notification.read ? 'bg-blue-600' : 'bg-gray-300'
                              }`} />
                              <div>
                                <p className="font-semibold text-gray-800">{notification.title}</p>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 border-t border-gray-200">
                        <button className="w-full text-blue-700 hover:text-blue-800 font-medium text-sm">
                          View All Notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile */}
                <div className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 cursor-pointer">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-800">John Doe</p>
                    <p className="text-xs text-gray-500">Customer</p>
                  </div>
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-800 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold text-sm">JD</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto pt-20">
          <div className="max-w-7xl mx-auto p-8">
            {/* HEADER */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John!</h2>
              <p className="text-gray-600 text-lg">Here's what's happening with your bookings today</p>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Trips</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Available Drivers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.availableDrivers}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalSpent}</p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-cyan-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT VEHICLES */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Vehicles</h2>
                <button 
                  onClick={viewAllVehicles}
                  className="text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-2"
                >
                  View All Vehicles <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {vehiclesLoading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}

              {vehiclesError && !vehiclesLoading && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-lg text-red-600 font-semibold">Error loading vehicles</p>
                  <p className="text-red-500 text-sm mt-1">{vehiclesError}</p>
                </div>
              )}

              {!vehiclesLoading && !vehiclesError && recentVehicles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentVehicles.map((pricing: Pricing) => {
                    const vehicle = pricing.vehicle_id;
                    const photos = vehicle.photos || [];
                    const primaryPhoto = photos[0];
                    const statusColor = getStatusColor(vehicle.availability_state);
                    const statusDisplay = getStatusDisplayText(vehicle.availability_state);
                    const isAvailable = pricing.active && vehicle.availability_state === 'available';
                    
                    return (
                      <div 
                        key={pricing._id} 
                        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                      >
                        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                          {primaryPhoto ? (
                            <img
                              src={primaryPhoto}
                              alt={pricing.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                              <CarIcon className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="absolute top-3 right-3">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${statusColor}`}>
                              {statusDisplay}
                            </span>
                          </div>
                          
                          <div className="absolute bottom-3 left-3">
                            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800">
                              {pricing.vehicle_class.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                            {pricing.name}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <MapPin className="w-4 h-4" />
                            <span>{pricing.branch_id?.name || 'Unknown Location'}</span>
                          </div>

                          <div className="mt-auto">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <p className="text-sm text-gray-500">Daily rate</p>
                                <p className="text-xl font-bold text-blue-700">
                                  ${parseDecimal(pricing.daily_rate)}
                                  <span className="text-sm text-gray-500 ml-1">/{pricing.currency}</span>
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleBookNow(pricing)}
                              disabled={!isAvailable}
                              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                                isAvailable
                                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 text-white shadow-md' 
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {isAvailable ? 'Book Now' : 'Unavailable'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!vehiclesLoading && !vehiclesError && recentVehicles.length === 0 && (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CarIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">No vehicles available</p>
                  <p className="text-gray-500 text-sm">Check back later for available vehicles.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AVAILABLE DRIVERS */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Available Drivers</h2>
                  <button 
                    onClick={viewAllDrivers}
                    className="text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-2"
                  >
                    View All <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {driversLoading && (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading drivers...</p>
                  </div>
                )}

                {driversError && !driversLoading && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="text-lg text-red-600 font-semibold">Error loading drivers</p>
                    <p className="text-red-500 text-sm mt-1">{driversError}</p>
                  </div>
                )}

                {!driversLoading && !driversError && recentDrivers.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Driver</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Location</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Rate</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {recentDrivers.map((driver) => (
                            <tr 
                              key={driver._id} 
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleBookDriver(driver)}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={getDriverImage(driver)} 
                                    alt={driver.user_id.full_name}
                                    className="w-10 h-10 rounded-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.user_id.full_name)}&background=3b82f6&color=fff`;
                                    }}
                                  />
                                  <div>
                                    <p className="font-medium text-gray-900">{driver.user_id.full_name}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                      <Briefcase className="w-3 h-3" />
                                      {driver.years_experience} yrs exp
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <MapPin className="w-3 h-3" />
                                  {driver.base_city}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">${driver.hourly_rate}</span>
                                  <span className="text-xs text-gray-500">per hour</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDriverStatusColor(driver.status)}`}>
                                  {getDriverStatusText(driver)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {!driversLoading && !driversError && recentDrivers.length === 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-700 mb-2">No drivers available</p>
                    <p className="text-gray-500 text-sm">Check back later for available drivers.</p>
                  </div>
                )}
              </div>

              {/* RECENT BOOKINGS */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Bookings</h2>
                  <button className="text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-2">
                    View All <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {dashboardBookings.map((booking) => (
                    <div key={booking.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <CarIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{booking.vehicle}</p>
                            <p className="text-sm text-gray-500">Driver: {booking.driver}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBookingStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{booking.time}</span>
                        </div>
                        <button 
                          onClick={() => navigate(`/bookings/${booking.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {booking.status === 'upcoming' ? 'Modify' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  <CheckCircleIcon className="w-5 h-5" />
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

      {notificationsOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setNotificationsOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboardy;