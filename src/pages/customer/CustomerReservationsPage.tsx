import { useState, type JSX } from 'react';
import { Calendar, Clock, Search, Menu, ChevronDown, MapPin, Phone, Mail, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Sidebar from '../../components/CustomerSidebar';

// Define types
interface Reservation {
  id: number;
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

interface AvailableVehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  image: string;
  price: number;
  location: string;
  mileage: string;
  availableFrom: string;
}

interface AvailabilityDates {
  startDate: string;
  endDate: string;
}

interface AvailabilityResult {
  available: boolean;
  availableVehicles: AvailableVehicle[];
  duration: number;
  totalCars: number;
  availableCount: number;
}

const Reservation = () => {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [checkingAvailability, setCheckingAvailability] = useState<boolean>(false);
  const [availabilityResult, setAvailabilityResult] = useState<AvailabilityResult | null>(null);
  const [availabilityDates, setAvailabilityDates] = useState<AvailabilityDates>({
    startDate: '',
    endDate: ''
  });

  const reservations: Reservation[] = [
    {
      id: 1,
      customer: "James Anderson",
      email: "james.a@email.com",
      phone: "+1 (555) 123-4567",
      vehicle: "Rolls-Royce Phantom",
      vehicleImage: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=400&q=80",
      startDate: "2025-11-28",
      endDate: "2025-12-02",
      status: "Upcoming",
      totalAmount: "$7,500",
      pickupLocation: "Beverly Hills Showroom",
      duration: "5 days"
    },
    {
      id: 2,
      customer: "Sarah Mitchell",
      email: "sarah.m@email.com",
      phone: "+1 (555) 234-5678",
      vehicle: "Bentley Continental GT",
      vehicleImage: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&q=80",
      startDate: "2025-11-25",
      endDate: "2025-11-30",
      status: "Active",
      totalAmount: "$6,000",
      pickupLocation: "Manhattan Office",
      duration: "6 days"
    },
    {
      id: 3,
      customer: "Michael Chen",
      email: "m.chen@email.com",
      phone: "+1 (555) 345-6789",
      vehicle: "Ferrari F8 Tributo",
      vehicleImage: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&q=80",
      startDate: "2025-11-25",
      endDate: "2025-11-27",
      status: "Active",
      totalAmount: "$5,000",
      pickupLocation: "Los Angeles Hub",
      duration: "3 days"
    },
    {
      id: 4,
      customer: "Emma Williams",
      email: "emma.w@email.com",
      phone: "+1 (555) 456-7890",
      vehicle: "Mercedes-Benz S-Class",
      vehicleImage: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&q=80",
      startDate: "2025-12-01",
      endDate: "2025-12-05",
      status: "Upcoming",
      totalAmount: "$3,200",
      pickupLocation: "Chicago Center",
      duration: "5 days"
    },
    {
      id: 5,
      customer: "David Rodriguez",
      email: "david.r@email.com",
      phone: "+1 (555) 567-8901",
      vehicle: "Lamborghini Huracán",
      vehicleImage: "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=400&q=80",
      startDate: "2025-12-03",
      endDate: "2025-12-07",
      status: "Upcoming",
      totalAmount: "$8,000",
      pickupLocation: "Miami Beach Location",
      duration: "4 days"
    },
    {
      id: 6,
      customer: "Sophie Laurent",
      email: "sophie.l@email.com",
      phone: "+1 (555) 678-9012",
      vehicle: "Porsche 911 Turbo S",
      vehicleImage: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400&q=80",
      startDate: "2025-11-26",
      endDate: "2025-11-29",
      status: "Active",
      totalAmount: "$2,850",
      pickupLocation: "San Francisco Depot",
      duration: "4 days"
    }
  ];

  const availableVehicles: AvailableVehicle[] = [
    {
      id: 1,
      make: "Rolls-Royce",
      model: "Phantom",
      year: 2024,
      image: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=600&q=80",
      price: 1500,
      location: "Beverly Hills",
      mileage: "2,450 mi",
      availableFrom: "2025-12-03"
    },
    {
      id: 2,
      make: "Bentley",
      model: "Continental GT",
      year: 2024,
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&q=80",
      price: 1200,
      location: "Manhattan",
      mileage: "3,120 mi",
      availableFrom: "2025-12-01"
    },
    {
      id: 3,
      make: "Lamborghini",
      model: "Huracán",
      year: 2024,
      image: "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=600&q=80",
      price: 2000,
      location: "Miami Beach",
      mileage: "1,890 mi",
      availableFrom: "2025-12-08"
    },
    {
      id: 4,
      make: "Ferrari",
      model: "F8 Tributo",
      year: 2024,
      image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&q=80",
      price: 2500,
      location: "Los Angeles",
      mileage: "980 mi",
      availableFrom: "2025-11-28"
    }
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Upcoming": return "bg-cyan-600 text-white";
      case "Active": return "bg-blue-800 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case "Active": return <Clock className="w-4 h-4" />;
      case "Upcoming": return <Calendar className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const checkAvailability = async (): Promise<void> => {
    if (!availabilityDates.startDate || !availabilityDates.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setCheckingAvailability(true);
    
    setTimeout(() => {
      const start = new Date(availabilityDates.startDate);
      const end = new Date(availabilityDates.endDate);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      const availableCars = availableVehicles.filter(car => {
        const availableFrom = new Date(car.availableFrom);
        return start >= availableFrom;
      });

      setAvailabilityResult({
        available: availableCars.length > 0,
        availableVehicles: availableCars,
        duration: duration,
        totalCars: availableVehicles.length,
        availableCount: availableCars.length
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

  const calculateTotal = (price: number, duration: number): number => {
    return price * duration;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/5 via-cyan-100/30 to-blue-500/10 flex">
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col lg:ml-74">

        {/* Navbar */}
        <nav className="fixed top-0 right-0 left-0 lg:left-74 z-40 bg-white/90 backdrop-blur-xl shadow-sm border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-center justify-between h-20">
              
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
                  <span className="text-gray-900 font-semibold">My Reservations</span>
                </div>
              </div>

              <div className="flex items-center gap-4 cursor-pointer">
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
        </nav>

        {/* Body */}
        <div className="flex-1 overflow-y-auto pt-20">
          <div className="max-w-7xl mx-auto p-8">

            {/* Availability Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-200 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Check Vehicle Availability</h3>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={availabilityDates.startDate}
                    onChange={(e) => setAvailabilityDates(prev => ({...prev, startDate: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={availabilityDates.endDate}
                    onChange={(e) => setAvailabilityDates(prev => ({...prev, endDate: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    min={availabilityDates.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={checkAvailability}
                    disabled={checkingAvailability}
                    className="w-full bg-gradient-to-r from-blue-800 to-cyan-500 hover:opacity-90 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {checkingAvailability ? 'Checking...' : 'Check Availability'}
                  </button>
                </div>
              </div>

              {availabilityResult && (
                <div className={`p-6 rounded-xl border-2 ${
                  availabilityResult.available 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-amber-50 border-amber-200'
                }`}>

                  <div className="flex items-center gap-3 mb-4">
                    {availabilityResult.available ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-amber-600" />
                    )}
                    <h4 className={`text-lg font-bold ${
                      availabilityResult.available ? 'text-emerald-800' : 'text-amber-800'
                    }`}>
                      {availabilityResult.available 
                        ? `🎉 ${availabilityResult.availableCount} vehicles available for your dates!` 
                        : 'No vehicles available for the selected dates'}
                    </h4>
                  </div>
                  
                  {availabilityResult.available && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      {availabilityResult.availableVehicles.map((vehicle) => (
                        <div key={vehicle.id} className="bg-white rounded-lg p-4 border border-blue-200">
                          <img 
                            src={vehicle.image} 
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="w-full h-24 object-cover rounded-lg mb-3"
                          />
                          <h5 className="font-semibold text-gray-800">{vehicle.make} {vehicle.model}</h5>
                          <p className="text-sm text-gray-600 mb-2">{vehicle.year}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-blue-700">${vehicle.price}/day</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Available
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Total for {availabilityResult.duration} days: 
                            <span className="font-semibold"> ${calculateTotal(vehicle.price, availabilityResult.duration)}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-200 mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-3">
                  {['all', 'active', 'upcoming'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedTab(tab)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        selectedTab === tab
                          ? 'bg-gradient-to-r from-blue-800 to-cyan-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      <span className="ml-2 text-xs bg-white/25 px-2 py-1 rounded-full">
                        {tab === 'all' ? reservations.length : reservations.filter(r => r.status.toLowerCase() === tab).length}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search reservations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 w-full md:w-96"
                  />
                </div>
              </div>
            </div>

            {/* Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-800">{filteredReservations.length}</span> reservations
                {searchTerm && (
                  <> for "<span className="font-semibold text-gray-800">{searchTerm}</span>"</>
                )}
                {selectedTab !== 'all' && (
                  <> • Status: <span className="font-semibold text-gray-800">{selectedTab}</span></>
                )}
              </p>
            </div>

            {/* Reservation Cards */}
            <div className="grid grid-cols-1 gap-6">
              {filteredReservations.map((reservation) => (
                <div key={reservation.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex flex-col lg:flex-row">

                    <div className="lg:w-80 h-64 lg:h-auto relative overflow-hidden">
                      <img 
                        src={reservation.vehicleImage} 
                        alt={reservation.vehicle}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                    </div>
                    
                    <div className="flex-1 p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-2xl font-bold text-gray-800">{reservation.customer}</h3>
                            <span className={`px-4 py-2 rounded-xl text-xs font-bold ${getStatusColor(reservation.status)} shadow-md flex items-center gap-2`}>
                              {getStatusIcon(reservation.status)}
                              {reservation.status}
                            </span>
                          </div>
                          <p className="text-xl text-gray-700 font-semibold mb-2">{reservation.vehicle}</p>
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{reservation.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{reservation.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-cyan-500 bg-clip-text text-transparent">
                            {reservation.totalAmount}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Pick-up Date</p>
                            <p className="text-lg font-bold text-gray-800">{reservation.startDate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Return Date</p>
                            <p className="text-lg font-bold text-gray-800">{reservation.endDate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Duration</p>
                            <p className="text-lg font-bold text-gray-800">{reservation.duration}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-5 h-5 text-blue-700" />
                          <span className="font-medium">{reservation.pickupLocation}</span>
                        </div>
                        <div className="flex gap-3">
                          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all">
                            View Details
                          </button>
                          <button className="bg-gradient-to-r from-blue-800 to-cyan-500 hover:opacity-90 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg">
                            Manage Booking
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredReservations.length === 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-blue-200">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600 font-semibold">No reservations found</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters or search terms</p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Reservation;
