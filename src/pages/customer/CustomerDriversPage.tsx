// Updated Drivers component with modal centered and blur only on main content
import { useState, useEffect } from 'react';
import { MapPin, Search, Menu, User, Calendar, X, Loader2 } from 'lucide-react';
import Sidebar from '../../components/CustomerSidebar';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchDrivers } from '../../features/driver/driverthunks'; 
import { selectDrivers, selectLoading, selectError } from '../../features/driver/driverSelectors';

interface Booking {
  id: number;
  driverName: string;
  price: number;
  location: string;
  date: string;
}

interface TransformedDriver {
  id: number;
  name: string;
  location: string;
  experience: string;
  rating: number | string;
  price: number;
  image: string;
}

const Drivers: React.FC = () => {
  const dispatch = useAppDispatch();
  const drivers = useAppSelector(selectDrivers);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [transformedDrivers, setTransformedDrivers] = useState<TransformedDriver[]>([]);

  const locations = ['All', 'Harare', 'Mutare', 'Bulawayo', 'Gweru'];

  useEffect(() => {
    dispatch(fetchDrivers());
  }, [dispatch]);

  useEffect(() => {
    if (drivers && drivers.length > 0) {
      const transformed = drivers.map((driver: any, index: number) => {
        const driverLocation = driver.city || driver.location || driver.address || 'Unknown Location';
        
        return {
          id: driver.id || index + 1,
          name: driver.name || driver.fullName || `Driver ${index + 1}`,
          location: driverLocation,
          experience: driver.experience || driver.yearsOfExperience || `${Math.floor(Math.random() * 10) + 1} Years`,
          rating: parseFloat(driver.rating) || parseFloat(driver.averageRating) || (4.5 + Math.random() * 0.5).toFixed(1),
          price: driver.price || driver.hourlyRate || driver.dailyRate || Math.floor(Math.random() * 30) + 30,
          image: driver.image || driver.profilePhoto || `https://images.unsplash.com/photo-${['1603415526960-f7e0328c63b1', '1592145950990-7a88af3b0c0', '1529626455594-4ff0802cfb7e', '1544723795-3fb6469f5b39'][index % 4]}?w=600&q=80`
        };
      });

      setTransformedDrivers(transformed);
    }
  }, [drivers]);

  const filteredDrivers = transformedDrivers.filter(driver => {
    const matchSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLocation = selectedLocation === 'All' ? true : driver.location === selectedLocation;

    return matchSearch && matchLocation;
  });

  const handleBookDriver = (driver: TransformedDriver) => {
    const newBooking: Booking = {
      id: Date.now(),
      driverName: driver.name,
      price: driver.price,
      location: driver.location,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    };

    setBookings([...bookings, newBooking]);
    alert(`Successfully booked ${driver.name} for $${driver.price}/day`);
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
                {transformedDrivers.length} drivers available
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-500 flex items-center justify-center text-white font-bold">
                JD
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto mt-20 p-4 md:p-8 max-w-7xl mx-auto w-full relative">

          {loading && (
            <div className="absolute inset-0 bg-white flex items-center justify-center z-40">
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
                {transformedDrivers.length} driver{transformedDrivers.length !== 1 ? 's' : ''}
                {filteredDrivers.length !== transformedDrivers.length && (
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
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Showing {filteredDrivers.length} of {transformedDrivers.length} drivers</span>
              </div>
            </div>
          </div>

          {filteredDrivers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-blue-200">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No drivers found</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrivers.map((driver) => (
                <div 
                  key={driver.id} 
                  className="bg-white rounded-2xl shadow-xl border border-blue-200 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-48 w-full overflow-hidden">
                    <img 
                      src={driver.image} 
                      alt={driver.name}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=600&q=80';
                      }}
                    />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 truncate">{driver.name}</h3>
                    <p className="text-gray-600 flex items-center gap-2 mt-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" /> 
                      <span className="truncate">{driver.location}</span>
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-gray-500 text-sm">Experience: {driver.experience}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {typeof driver.rating === 'number' ? driver.rating.toFixed(1) : driver.rating}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-800 to-cyan-500 bg-clip-text text-transparent">
                          ${driver.price}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">/day</span>
                      </div>
                      <button
                        onClick={() => handleBookDriver(driver)}
                        className="bg-gradient-to-r from-blue-800 to-cyan-500 text-white px-4 md:px-5 py-2 rounded-xl font-semibold shadow hover:opacity-90 transition-opacity"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal overlay positioned only over main content area */}
          {showBookingsModal && (
            <>
              {/* Overlay for main content area only */}
              <div className="fixed inset-0 z-50 lg:left-74 bg-black/50 backdrop-blur-sm"></div>
              
              {/* Modal container centered */}
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
                          const driverImage = transformedDrivers.find(d => d.name === booking.driverName)?.image || 
                            'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=600&q=80';
                          
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
                                          <Calendar className="w-4 h-4" />
                                          {booking.date}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-blue-800">
                                        ${booking.price}
                                      </div>
                                      <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full mt-1">
                                        Confirmed
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
                            ${bookings.reduce((total, b) => total + b.price, 0)}
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
      <style >{`
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