import { useState, useEffect, type JSXElementConstructor, type ReactElement, type ReactNode, type ReactPortal, type Key } from 'react';
import { 
  MapPin, 
  Users, 
  DoorOpen, 
  Shield, 
  Zap, 
  Fuel, 
  Cog, 
  CheckCircle,
  Clock,
  CreditCard,
  AlertCircle,
  Calendar,
  Phone,
  X,
  User,
  IdCard,
  Check,
  ChevronDown
} from 'lucide-react';
import ServiceMaintenanceSection from '../components/servicemaintanance';
import type { Pricing, ServiceOrder, ServiceSchedule } from '../servicetypes';
import ReservationService from '../Services/bookvihicle_service'; 
import UserService from '../Services/users_service'; // Import the UserService

interface BookingDetailsProps {
  pricing: Pricing;
  serviceOrders: ServiceOrder[];
  serviceSchedules: ServiceSchedule[];
  loadingServiceOrders: boolean;
  loadingServiceSchedules: boolean;
}

// Define user type based on the API response
interface User {
  _id: string;
  email: string;
  phone: string;
  roles: string[];
  full_name: string;
  status: string;
  email_verified: boolean;
  auth_providers: any[];
  created_at: string;
  updated_at: string;
  __v: number;
}

const BookingDetails = ({ 
  pricing, 
  serviceOrders, 
  serviceSchedules, 
  loadingServiceOrders, 
  loadingServiceSchedules 
}: BookingDetailsProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [, setBookingCode] = useState('');
  const [bookingSuccessData, setBookingSuccessData] = useState<{
    code: string;
    vehicle: string;
    total: string;
    email: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [bookingDetails, setBookingDetails] = useState({
    startDate: '',
    endDate: '',
    days: 1,
    insurance: 'basic' as 'basic' | 'premium' | 'full',
    addons: [] as string[]
  });
  
  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseCountry: 'ZW',
    licenseClass: '',
    licenseExpiry: '',
    notes: ''
  });

  // New state for users
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [showUsersDropdown, setShowUsersDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setUsersError(null);
      const response = await UserService.getAllUsers();
      
      // The API response might be in different formats
      // Check if it's an array or has a data property
      if (Array.isArray(response)) {
        setUsers(response);
      } else if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.users && Array.isArray(response.users)) {
        setUsers(response.users);
      } else {
        setUsers([]);
        setUsersError('Unexpected response format');
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      setUsersError(error.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setBookingForm({
      ...bookingForm,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone
    });
    setShowUsersDropdown(false);
  };

  const generateBookingCode = () => {
    const prefix = 'HRE';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `${prefix}-${year}-${random}`;
  };

  const parseDecimal = (decimalObj: { $numberDecimal: string }): number => {
    if (!decimalObj || !decimalObj.$numberDecimal) return 0;
    return parseFloat(decimalObj.$numberDecimal);
  };

  const calculateTotal = () => {
    const dailyRate = parseDecimal(pricing.daily_rate);
    const days = bookingDetails.days || 1;
    const subtotal = dailyRate * days;
    
    const insuranceCost = bookingDetails.insurance === 'basic' ? 15 : 
                          bookingDetails.insurance === 'premium' ? 25 : 40;
    
    const taxAmount = subtotal * (pricing.taxes.reduce((sum: number, tax: { rate: number }) => sum + tax.rate, 0));
    const feeAmount = pricing.fees.reduce((sum: number, fee: { amount: { $numberDecimal: string } }) => sum + parseDecimal(fee.amount), 0);
    
    return subtotal + taxAmount + feeAmount + (insuranceCost * days);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const vehicle = pricing.vehicle_id;
  const branch = pricing.branch_id;
  const photos = vehicle.photos || [];
  const primaryPhoto = photos[selectedPhoto] || photos[0];

  const handleConfirmBooking = () => {
    if (vehicle.availability_state !== 'available') return;
    setShowBookingModal(true);
    setSubmitError(null);
  };

  const handleSubmitBooking = async () => {
    // Validate required fields
    if (!bookingForm.fullName || !bookingForm.phone || !bookingForm.email || 
        !bookingForm.licenseNumber || !bookingForm.licenseExpiry || 
        !bookingDetails.startDate || !bookingDetails.endDate) {
      setSubmitError('Please fill in all required fields');
      return;
    }

    const generatedBookingCode = generateBookingCode();
    const bookingData = {
      code: generatedBookingCode,
      created_channel: "web",
      vehicle_id: vehicle._id,
      vehicle_model_id: vehicle.vehicle_model_id,
      pickup: {
        branch_id: branch._id,
        at: new Date(bookingDetails.startDate).toISOString()
      },
      dropoff: {
        branch_id: branch._id,
        at: new Date(bookingDetails.endDate).toISOString()
      },
      pricing: {
        currency: pricing.currency,
        breakdown: [
          {
            label: "Base daily rate",
            quantity: bookingDetails.days,
            unit_amount: parseDecimal(pricing.daily_rate).toFixed(2),
            total: (parseDecimal(pricing.daily_rate) * bookingDetails.days).toFixed(2)
          }
        ],
        fees: pricing.fees.map((fee: any) => ({
          code: fee.code,
          amount: parseDecimal(fee.amount).toFixed(2)
        })),
        taxes: pricing.taxes.map((tax: any) => ({
          code: tax.code,
          rate: tax.rate,
          amount: (parseDecimal(pricing.daily_rate) * bookingDetails.days * tax.rate).toFixed(2)
        })),
        discounts: [],
        grand_total: calculateTotal().toFixed(2),
        computed_at: new Date().toISOString()
      },
      payment_summary: {
        status: "unpaid",
        paid_total: "0.00",
        outstanding: calculateTotal().toFixed(2),
        last_payment_at: null
      },
      driver_snapshot: {
        full_name: bookingForm.fullName,
        phone: bookingForm.phone,
        email: bookingForm.email,
        driver_license: {
          number: bookingForm.licenseNumber,
          country: bookingForm.licenseCountry,
          class: bookingForm.licenseClass,
          expires_at: new Date(bookingForm.licenseExpiry).toISOString(),
          verified: false
        }
      },
      notes: bookingForm.notes
    };

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Call the ReservationService to create the reservation
      const response = await ReservationService.createReservation(bookingData);
      
      // Success - show success popup
      const actualBookingCode = response?.code || generatedBookingCode;
      
      setBookingSuccessData({
        code: actualBookingCode,
        vehicle: pricing.name,
        total: formatCurrency(calculateTotal()),
        email: bookingForm.email
      });
      
      setBookingCode(actualBookingCode);
      setShowSuccessPopup(true);
      setShowBookingModal(false);
      
      // Reset form
      setBookingForm({
        fullName: '',
        phone: '',
        email: '',
        licenseNumber: '',
        licenseCountry: 'ZW',
        licenseClass: '',
        licenseExpiry: '',
        notes: ''
      });
      setSelectedUser(null);
      
      // Auto-hide success popup after 8 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 8000);
      
    } catch (error: any) {
      console.error('Booking failed:', error);
      
      // Handle different error formats
      let errorMessage = 'Failed to create booking. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.response?.data) {
        // Try to extract error message from API response
        const apiError = error.response.data;
        if (apiError.message) {
          errorMessage = apiError.message;
        } else if (apiError.error) {
          errorMessage = apiError.error;
        } else if (typeof apiError === 'string') {
          errorMessage = apiError;
        }
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Small Success Popup - Positioned on the right */}
      {showSuccessPopup && bookingSuccessData && (
        <div className="fixed top-6 right-6 z-50 max-w-md">
          <div className="bg-white rounded-xl shadow-2xl border border-green-200 overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-green-100 text-sm">Reservation created successfully</p>
                </div>
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className="ml-auto p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Success Body */}
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{bookingSuccessData.vehicle}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-green-600">{bookingSuccessData.total}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex gap-2">
                  {/* Add any additional success message elements here */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Complete Your Booking</h2>
                  <p className="text-blue-100">I am booking {pricing.name}</p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Error Message */}
              {submitError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <p className="text-red-800 font-medium">{submitError}</p>
                  </div>
                </div>
              )}

              {/* User Selection Dropdown */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border-2 border-purple-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Select Existing User
                </h3>
                <div className="relative">
                  <button
                    onClick={() => setShowUsersDropdown(!showUsersDropdown)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all flex justify-between items-center hover:bg-gray-50"
                    disabled={isSubmitting || loadingUsers}
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      {selectedUser ? (
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{selectedUser.full_name}</p>
                          <p className="text-sm text-gray-600">{selectedUser.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          {loadingUsers ? 'Loading users...' : 'Select a user to auto-fill details'}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showUsersDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showUsersDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {loadingUsers ? (
                        <div className="p-4 text-center text-gray-500">
                          Loading users...
                        </div>
                      ) : usersError ? (
                        <div className="p-4 text-center text-red-500">
                          {usersError}
                        </div>
                      ) : users.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No users found
                        </div>
                      ) : (
                        users.map((user) => (
                          <button
                            key={user._id}
                            onClick={() => handleSelectUser(user)}
                            className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{user.full_name}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                <p className="text-xs text-gray-500">{user.phone}</p>
                              </div>
                              {selectedUser?._id === user._id && (
                                <Check className="w-5 h-5 text-green-500" />
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {selectedUser && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700">
                      ✓ {selectedUser.full_name}'s details have been auto-filled
                    </p>
                  </div>
                )}
              </div>

              {/* Booking Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Booking Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Vehicle</p>
                    <p className="font-bold text-gray-900">{pricing.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Location</p>
                    <p className="font-bold text-gray-900">{branch.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-bold text-gray-900">{bookingDetails.days} days</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-bold text-blue-600 text-lg">{formatCurrency(calculateTotal())}</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={bookingForm.fullName}
                      onChange={(e) => setBookingForm({...bookingForm, fullName: e.target.value})}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                      placeholder="+263771234567"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Driver License Information */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <IdCard className="w-5 h-5 text-blue-600" />
                  Driver License Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      License Number *
                    </label>
                    <input
                      type="text"
                      value={bookingForm.licenseNumber}
                      onChange={(e) => setBookingForm({...bookingForm, licenseNumber: e.target.value})}
                      placeholder="DL1234567"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      License Country *
                    </label>
                    <select
                      value={bookingForm.licenseCountry}
                      onChange={(e) => setBookingForm({...bookingForm, licenseCountry: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={isSubmitting}
                    >
                      <option value="ZW">Zimbabwe (ZW)</option>
                      <option value="ZA">South Africa (ZA)</option>
                      <option value="US">United States (US)</option>
                      <option value="GB">United Kingdom (GB)</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      License Class
                    </label>
                    <input
                      type="text"
                      value={bookingForm.licenseClass}
                      onChange={(e) => setBookingForm({...bookingForm, licenseClass: e.target.value})}
                      placeholder="Class 4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      License Expiry Date *
                    </label>
                    <input
                      type="date"
                      value={bookingForm.licenseExpiry}
                      onChange={(e) => setBookingForm({...bookingForm, licenseExpiry: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                  placeholder="Any special requests or information we should know..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-3xl border-t-2 border-gray-200">
              <div className="flex gap-4">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitBooking}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Vehicle Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Overview with Enhanced Image Gallery */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 overflow-hidden">
                {primaryPhoto ? (
                  <img
                    src={primaryPhoto}
                    alt={pricing.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <span className="text-gray-400 text-lg font-medium">No Image Available</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Image Thumbnails */}
              {photos.length > 1 && (
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto">
                  {photos.map((photo: string | undefined, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhoto(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedPhoto === index 
                          ? 'border-white shadow-lg scale-105' 
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              <div className="absolute top-4 right-4 flex gap-2">
                <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-blue-600 text-sm font-bold rounded-full shadow-lg">
                  {pricing.vehicle_class.toUpperCase()}
                </span>
                <span className={`px-4 py-2 backdrop-blur-sm rounded-full text-sm font-bold shadow-lg ${
                  vehicle.availability_state === 'available' 
                    ? 'bg-green-500/90 text-white'
                    : 'bg-red-500/90 text-white'
                }`}>
                  {vehicle.availability_state === 'available' ? '✓ Available' : '✗ Unavailable'}
                </span>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{pricing.name}</h2>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{vehicle.metadata?.year || 'Year N/A'}</span>
                    <span className="mx-2">•</span>
                    <span className="text-sm">{vehicle.color}</span>
                  </div>
                </div>
                <div className="text-right bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {formatCurrency(parseDecimal(pricing.daily_rate))}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">/day</p>
                  <p className="text-xs text-gray-500 mt-1">+ taxes & fees</p>
                </div>
              </div>

              {/* Vehicle Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: Users, label: 'Seats', value: vehicle.metadata?.seats || 'N/A', color: 'blue' },
                  { icon: DoorOpen, label: 'Doors', value: vehicle.metadata?.doors || 'N/A', color: 'cyan' },
                  { icon: Fuel, label: 'Fuel Type', value: vehicle.metadata?.fuel_type || 'N/A', color: 'green' },
                  { icon: Cog, label: 'Transmission', value: vehicle.metadata?.transmission || 'N/A', color: 'purple' }
                ].map((stat, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <stat.icon className={`w-6 h-6 text-${stat.color}-500 mb-2`} />
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className="font-bold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Pickup Location */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Pickup Location</h3>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">{branch.name}</p>
                  {branch.address && (
                    <p className="text-sm text-gray-700 flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                      {branch.address}
                    </p>
                  )}
                  {branch.phone && (
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-500" />
                      {branch.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Features & Specifications */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-500" />
              Features & Specifications
            </h3>
            
            {vehicle.metadata?.features && vehicle.metadata.features.length > 0 && (
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Key Features</h4>
                <div className="flex flex-wrap gap-3">
                  {vehicle.metadata.features.map((feature: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, index: Key | null | undefined) => (
                    <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200 hover:shadow-md transition-shadow">
                      ✓ {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-gray-900 mb-4 text-lg">Vehicle Details</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Plate Number', value: vehicle.plate_number },
                    { label: 'Color', value: vehicle.color },
                    { label: 'VIN', value: vehicle.vin },
                    { label: 'Odometer', value: `${vehicle.odometer_km.toLocaleString()} km` }
                  ].map((detail, index) => (
                    <div key={index} className="flex justify-between py-3 border-b border-gray-200 hover:bg-gray-50 px-2 rounded transition-colors">
                      <span className="text-gray-600 font-medium">{detail.label}</span>
                      <span className="font-semibold text-gray-900">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-4 text-lg">Pricing Options</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Weekly Rate', value: formatCurrency(parseDecimal(pricing.weekly_rate)) },
                    { label: 'Weekend Rate', value: formatCurrency(parseDecimal(pricing.weekend_rate)) },
                    { label: 'Monthly Rate', value: formatCurrency(parseDecimal(pricing.monthly_rate)) },
                    { label: 'Currency', value: pricing.currency }
                  ].map((detail, index) => (
                    <div key={index} className="flex justify-between py-3 border-b border-gray-200 hover:bg-gray-50 px-2 rounded transition-colors">
                      <span className="text-gray-600 font-medium">{detail.label}</span>
                      <span className="font-bold text-blue-600">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance & Service Section */}
          <ServiceMaintenanceSection
            vehicle={vehicle}
            serviceOrders={serviceOrders}
            serviceSchedules={serviceSchedules}
            loadingServiceOrders={loadingServiceOrders}
            loadingServiceSchedules={loadingServiceSchedules}
            formatDate={formatDate}
          />

          {/* Notes & Information */}
          {(pricing.notes || vehicle.metadata?.notes) && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Important Information</h3>
              </div>
              <p className="text-amber-900 leading-relaxed">{pricing.notes || vehicle.metadata?.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column - Booking Summary (Sticky) */}
        <div className="space-y-6">
          <div className="lg:sticky lg:top-28 space-y-6">
            {/* Booking Dates */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Select Dates
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={bookingDetails.startDate}
                    onChange={(e) => setBookingDetails({...bookingDetails, startDate: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={bookingDetails.endDate}
                    onChange={(e) => setBookingDetails({...bookingDetails, endDate: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rental Days
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={() => setBookingDetails({...bookingDetails, days: Math.max(1, bookingDetails.days - 1)})}
                      className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-l-xl hover:from-blue-600 hover:to-cyan-600 transition-all"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={bookingDetails.days}
                      onChange={(e) => setBookingDetails({...bookingDetails, days: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-3 border-y-2 border-gray-200 text-center font-bold text-lg"
                      min="1"
                    />
                    <button
                      onClick={() => setBookingDetails({...bookingDetails, days: bookingDetails.days + 1})}
                      className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-r-xl hover:from-blue-600 hover:to-cyan-600 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Insurance Options */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Insurance Options
              </h3>
              
              <div className="space-y-3">
                {(['basic', 'premium', 'full'] as const).map((type) => (
                  <label key={type} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    bookingDetails.insurance === type 
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="insurance"
                      value={type}
                      checked={bookingDetails.insurance === type}
                      onChange={(e) => setBookingDetails({...bookingDetails, insurance: e.target.value as 'basic' | 'premium' | 'full'})}
                      className="w-5 h-5 text-blue-600 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold capitalize text-gray-900">{type} Coverage</span>
                        <span className="text-blue-600 font-bold text-lg">
                          {type === 'basic' ? '$15/day' : type === 'premium' ? '$25/day' : '$40/day'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {type === 'basic' ? 'Basic liability coverage' : 
                         type === 'premium' ? 'Extended coverage with lower deductible' :
                         'Full coverage with zero deductible'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Price Breakdown</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-blue-100">Daily Rate × {bookingDetails.days} days</span>
                  <span className="font-semibold">{formatCurrency(parseDecimal(pricing.daily_rate) * bookingDetails.days)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-blue-100">Insurance ({bookingDetails.insurance})</span>
                  <span className="font-semibold">
                    {formatCurrency((bookingDetails.insurance === 'basic' ? 15 : 
                      bookingDetails.insurance === 'premium' ? 25 : 40) * bookingDetails.days)}
                  </span>
                </div>
                
                {pricing.taxes.map((tax: { _id: Key | null | undefined; description: any; code: any; rate: number; }) => (
                  <div key={tax._id} className="flex justify-between">
                    <span className="text-blue-100">{tax.description || tax.code}</span>
                    <span className="font-semibold">{formatCurrency(parseDecimal(pricing.daily_rate) * bookingDetails.days * tax.rate)}</span>
                  </div>
                ))}
                
                {pricing.fees.map((fee: { _id: Key | null | undefined; description: any; code: any; amount: { $numberDecimal: string; }; }) => (
                  <div key={fee._id} className="flex justify-between">
                    <span className="text-blue-100">{fee.description || fee.code}</span>
                    <span className="font-semibold">{formatCurrency(parseDecimal(fee.amount))}</span>
                  </div>
                ))}
                
                <div className="pt-4 border-t-2 border-white/30 mt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total Amount</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                  <p className="text-blue-100 text-sm mt-1">Including all taxes and fees</p>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={vehicle.availability_state !== 'available'}
                className={`w-full mt-4 py-4 rounded-xl font-bold text-lg transition-all transform ${
                  vehicle.availability_state === 'available'
                    ? 'bg-white text-blue-600 hover:scale-105 shadow-lg hover:shadow-xl'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
              >
                {vehicle.availability_state === 'available' ? '🚗 Confirm Booking' : 'Currently Unavailable'}
              </button>

              {vehicle.availability_state === 'available' && (
                <div className="mt-4 flex items-center justify-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>This vehicle is available for booking</span>
                </div>
              )}
            </div>

            {/* Help & Support */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-blue-100 shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Flexible cancellation policy</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Secure payment processing</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Multiple payment methods</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;