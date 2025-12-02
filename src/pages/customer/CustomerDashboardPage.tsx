import { useState } from 'react';
import { 
  ChevronRight, MapPin, 
  Menu, ChevronDown, Bell, X 
} from 'lucide-react';
import Sidebar from '../../components/CustomerSidebar';

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  image: string;
  status: string;
  price: number;
  location: string;
  mileage: string;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const Dashboardy = () => {
  const [] = useState('all');
  const [] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  const handleBookNow = (carInfo: Car) => {
    setSelectedCar(carInfo);
    setBookingDialogOpen(true);
  };

  const confirmBooking = () => {
    if (!selectedCar) return;
    alert(
      `Booking confirmed for ${selectedCar.make} ${selectedCar.model}
Price: ${selectedCar.price}/day
Location: ${selectedCar.location}`
    );
    setBookingDialogOpen(false);
    setSelectedCar(null);
  };

  const luxuryCars: Car[] = [
    {
      id: 1,
      make: "Rolls-Royce",
      model: "Phantom",
      year: 2024,
      image: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=600&q=80",
      status: "Available",
      price: 1500,
      location: "Beverly Hills",
      mileage: "2,450 mi"
    },
    {
      id: 2,
      make: "Bentley",
      model: "Continental GT",
      year: 2024,
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&q=80",
      status: "Reserved",
      price: 1200,
      location: "Manhattan",
      mileage: "3,120 mi"
    },
    {
      id: 3,
      make: "Lamborghini",
      model: "Huracán",
      year: 2024,
      image: "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=600&q=80",
      status: "Available",
      price: 2000,
      location: "Miami Beach",
      mileage: "1,890 mi"
    },
    {
      id: 4,
      make: "Ferrari",
      model: "F8 Tributo",
      year: 2024,
      image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&q=80",
      status: "In Use",
      price: 2500,
      location: "Los Angeles",
      mileage: "980 mi"
    },
    {
      id: 5,
      make: "Porsche",
      model: "911 Turbo S",
      year: 2024,
      image: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=600&q=80",
      status: "Available",
      price: 950,
      location: "San Francisco",
      mileage: "4,230 mi"
    },
    {
      id: 6,
      make: "Mercedes-Benz",
      model: "S-Class",
      year: 2024,
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80",
      status: "Reserved",
      price: 800,
      location: "Chicago",
      mileage: "5,670 mi"
    }
  ];

  const notifications: NotificationItem[] = [
    {
      id: 1,
      title: "Booking Confirmed",
      message: "Your Rolls-Royce Phantom booking has been confirmed",
      time: "5 min ago",
      read: false
    },
    {
      id: 2,
      title: "Payment Received",
      message: "Payment of $7,500 has been processed successfully",
      time: "1 hour ago",
      read: false
    },
    {
      id: 3,
      title: "Reminder",
      message: "Your Bentley Continental GT booking starts tomorrow",
      time: "2 hours ago",
      read: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-[#00AEEF] text-white";
      case "Reserved": return "bg-[#003A93] text-white";
      case "In Use": return "bg-cyan-600 text-white";
      case "Upcoming": return "bg-blue-600 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-white flex">
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-74">

        {/* NAVBAR */}
        <nav className="fixed top-0 right-0 left-0 lg:left-74 z-40 bg-white/80 backdrop-blur-xl shadow-sm border-b border-[#003A93]/20">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-center justify-between h-20">
              
              {/* LEFT */}
              <div className="flex items-center">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden mr-4 p-2 rounded-xl bg-gray-100 hover:bg-gray-200"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-600">Dashboard</span>
                  <span className="text-gray-300">›</span>
                  <span className="text-gray-800 font-medium">Customer Dashboard</span>
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
                                !notification.read ? 'bg-[#003A93]' : 'bg-gray-300'
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
                        <button className="w-full text-[#003A93] hover:text-[#00AEEF] font-medium text-sm">
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
                    <div className="w-10 h-10 bg-gradient-to-br from-[#003A93] to-[#00AEEF] rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-semibold text-sm">JD</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
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
            <div className="mb-10">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
              <p className="text-gray-600 text-lg">Manage your premium vehicle fleet and reservations</p>
            </div>

            {/* FLEET */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Premium Fleet</h2>
                <button className="text-[#003A93] hover:text-[#00AEEF] font-semibold flex items-center gap-2">
                  View All <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {luxuryCars.map((car) => (
                  <div 
                    key={car.id} 
                    className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#00AEEF]/20 hover:shadow-2xl transition-all hover:-translate-y-2"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={car.image} 
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <span className={`px-4 py-2 rounded-xl text-xs font-bold ${getStatusColor(car.status)}`}>
                          {car.status}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white text-sm drop-shadow">
                        <MapPin className="w-4 h-4" />
                        {car.location}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-800">{car.make}</h3>
                      <p className="text-gray-600">{car.model} • {car.year}</p>

                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <p className="text-sm text-gray-500">Daily Rate</p>
                          <span className="text-3xl font-bold text-[#003A93]">
                            ${car.price}
                          </span>
                        </div>

                        <button 
                          onClick={() => handleBookNow(car)}
                          className="bg-gradient-to-r from-[#003A93] to-[#00AEEF] hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold shadow-md"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BOOKING CONFIRMATION */}
            {bookingDialogOpen && selectedCar && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">

                  <div className="p-6 flex justify-between items-center border-b">
                    <h3 className="text-xl font-bold text-gray-800">Confirm Booking</h3>
                    <button 
                      onClick={() => setBookingDialogOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-xl"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img 
                        src={selectedCar.image} 
                        alt={`${selectedCar.make} ${selectedCar.model}`}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">
                          {selectedCar.make} {selectedCar.model}
                        </h4>
                        <p className="text-gray-600">
                          {selectedCar.year} • {selectedCar.location}
                        </p>
                        <p className="text-2xl font-bold text-[#003A93] mt-1">
                          ${selectedCar.price}/day
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex justify-between">
                        <span>Vehicle:</span>
                        <span className="font-medium">{selectedCar.make} {selectedCar.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Daily Rate:</span>
                        <span className="font-medium">${selectedCar.price}/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="font-medium">{selectedCar.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mileage:</span>
                        <span className="font-medium">{selectedCar.mileage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(selectedCar.status)}`}>
                          {selectedCar.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t flex gap-3">
                    <button 
                      onClick={() => setBookingDialogOpen(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={confirmBooking}
                      className="flex-1 bg-gradient-to-r from-[#003A93] to-[#00AEEF] hover:opacity-90 text-white py-3 rounded-xl font-semibold shadow-md"
                    >
                      Confirm Booking
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>

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
