import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
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
  Phone
} from 'lucide-react';
import { useAppSelector } from "../../app/hooks";
import { selectVehicles } from '../../features/vehicles/vehiclesSelectors';

interface Branch {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
}

interface VehicleMetadata {
  gps_device_id?: string;
  notes?: string;
  seats?: number;
  doors?: number;
  features?: string[];
  fuel_type?: string;
  transmission?: string;
  year?: number;
}

interface Vehicle {
  _id: string;
  vin: string;
  plate_number: string;
  vehicle_model_id: string;
  branch_id: string;
  odometer_km: number;
  color: string;
  status: string;
  availability_state: string;
  photos: string[];
  last_service_at: string | null;
  last_service_odometer_km: number | null;
  metadata: VehicleMetadata;
  created_at: string;
  updated_at: string;
}

interface SeasonalOverride {
  season: {
    name: string;
    start: string;
    end: string;
  };
  daily_rate: { $numberDecimal: string };
  weekly_rate: { $numberDecimal: string };
  monthly_rate: { $numberDecimal: string };
  weekend_rate: { $numberDecimal: string };
  _id: string;
}

interface Tax {
  code: string;
  rate: number;
  description: string;
  _id: string;
}

interface Fee {
  code: string;
  amount: { $numberDecimal: string };
  description: string;
  _id: string;
}

interface Pricing {
  _id: string;
  branch_id: Branch;
  vehicle_class: string;
  vehicle_model_id: string | null;
  vehicle_id: Vehicle;
  currency: string;
  daily_rate: { $numberDecimal: string };
  weekly_rate: { $numberDecimal: string };
  monthly_rate: { $numberDecimal: string };
  weekend_rate: { $numberDecimal: string };
  seasonal_overrides: SeasonalOverride[];
  taxes: Tax[];
  fees: Fee[];
  active: boolean;
  valid_from: string;
  valid_to: string;
  name: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const vehicles = useAppSelector(selectVehicles);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [bookingDetails, setBookingDetails] = useState({
    startDate: '',
    endDate: '',
    days: 1,
    insurance: 'basic',
    addons: [] as string[]
  });
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    const fetchPricing = () => {
      try {
        const pricingArray = getPricingArray();
        const foundPricing = pricingArray.find(p => p._id === id);
        
        if (foundPricing) {
          setPricing(foundPricing);
        } else {
          console.error('Pricing not found');
        }
      } catch (error) {
        console.error('Error fetching pricing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [id, vehicles]);

  const getPricingArray = (): Pricing[] => {
    if (!vehicles) return [];
    
    if (typeof vehicles === 'object' && vehicles !== null) {
      if ('data' in vehicles && typeof vehicles.data === 'object' && vehicles.data !== null) {
        const apiResponse = vehicles as any;
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

  const parseDecimal = (decimalObj: { $numberDecimal: string }): number => {
    if (!decimalObj || !decimalObj.$numberDecimal) return 0;
    return parseFloat(decimalObj.$numberDecimal);
  };

  const calculateTotal = () => {
    if (!pricing) return 0;
    
    const dailyRate = parseDecimal(pricing.daily_rate);
    const days = bookingDetails.days || 1;
    const subtotal = dailyRate * days;
    
    const insuranceCost = bookingDetails.insurance === 'basic' ? 15 : 
                          bookingDetails.insurance === 'premium' ? 25 : 40;
    
    const taxAmount = subtotal * (pricing.taxes.reduce((sum, tax) => sum + tax.rate, 0));
    const feeAmount = pricing.fees.reduce((sum, fee) => sum + parseDecimal(fee.amount), 0);
    
    return subtotal + taxAmount + feeAmount + (insuranceCost * days);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!pricing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-6">The vehicle you're looking for doesn't exist or is no longer available.</p>
          <button
            onClick={() => navigate('/vehicle')}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
          >
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  const vehicle = pricing.vehicle_id;
  const branch = pricing.branch_id;
  const photos = vehicle.photos || [];
  const primaryPhoto = photos[selectedPhoto] || photos[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => navigate('/vehicle')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium">Back to Vehicles</span>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full font-semibold shadow-lg">
                
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Complete Your Booking
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    {photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedPhoto(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedPhoto === index 
                            ? 'border-white shadow-lg scale-105' 
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={photo} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
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
                    {vehicle.metadata.features.map((feature, index) => (
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
                  {['basic', 'premium', 'full'].map((type) => (
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
                        onChange={(e) => setBookingDetails({...bookingDetails, insurance: e.target.value})}
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
                  
                  {pricing.taxes.map((tax) => (
                    <div key={tax._id} className="flex justify-between">
                      <span className="text-blue-100">{tax.description || tax.code}</span>
                      <span className="font-semibold">{formatCurrency(parseDecimal(pricing.daily_rate) * bookingDetails.days * tax.rate)}</span>
                    </div>
                  ))}
                  
                  {pricing.fees.map((fee) => (
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
                  onClick={() => {
                    alert(`Booking confirmed!\n\nVehicle: ${pricing.name}\nTotal: ${formatCurrency(calculateTotal())}\nLocation: ${branch.name}`);
                    navigate('/vehicles');
                  }}
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
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Our support team is available 24/7 to assist you with your booking.
                </p>
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
    </div>
  );
};

export default BookingPage;