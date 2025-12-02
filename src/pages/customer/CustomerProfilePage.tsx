import { useState } from 'react';
import { User, Edit, Save, X, MapPin, Calendar, CreditCard, Shield } from 'lucide-react';
import Sidebar from '../../components/CustomerSidebar';

const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    _id: "6750f1e0c1a2b34de0123456",
    user: "665a8c7be4f1c23b04d12345",
    role: "customer",
    full_name: "John Doe",
    dob: "1990-05-21T00:00:00Z",
    national_id: "12-3456789Z12",
    driver_license: {
      number: "DL1234567",
      imageUrl: "https://example.com/uploads/license.jpg",
      country: "ZW",
      class: "Class 4",
      expires_at: "2027-12-31T23:59:59Z",
      verified: false
    },
    address: {
      line1: "123 Borrowdale Road",
      line2: "Apartment 4B",
      city: "Harare",
      region: "Harare Province",
      postal_code: "0000",
      country: "Zimbabwe"
    },
    preferences: {
      currency: "USD",
      locale: "en-ZW"
    },
    gdpr: {
      marketing_opt_in: false
    },
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-02-01T08:00:00Z"
  });

  const handleSave = () => {
    // Here you would typically make an API call to save the profile
    setIsEditing(false);
    // Add your save logic here
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-74">
        {/* Navbar */}
        <nav className="fixed top-0 right-0 left-0 lg:left-74 z-40 bg-white/80 backdrop-blur-xl shadow-sm border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden mr-4 p-2 rounded-xl bg-slate-100/50 hover:bg-slate-200 transition-all"
                >
                  <User className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-600">Dashboard</span>
                  <span className="text-slate-300">›</span>
                  <span className="text-gray-800 font-medium">Profile</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto pt-20">
          <div className="max-w-4xl mx-auto p-8">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {profile.full_name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">{profile.full_name}</h1>
                    <p className="text-gray-600 capitalize">{profile.role}</p>
                  </div>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                  >
                    <Edit className="w-5 h-5" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-xl">{profile.full_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={profile.dob.split('T')[0]}
                        onChange={(e) => setProfile({...profile, dob: e.target.value + 'T00:00:00Z'})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-xl">{formatDate(profile.dob)}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.national_id}
                        onChange={(e) => setProfile({...profile, national_id: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-xl">{profile.national_id}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Address
                </h2>
                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={profile.address.line1}
                        onChange={(e) => setProfile({
                          ...profile, 
                          address: {...profile.address, line1: e.target.value}
                        })}
                        placeholder="Address Line 1"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={profile.address.line2}
                        onChange={(e) => setProfile({
                          ...profile, 
                          address: {...profile.address, line2: e.target.value}
                        })}
                        placeholder="Address Line 2"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={profile.address.city}
                          onChange={(e) => setProfile({
                            ...profile, 
                            address: {...profile.address, city: e.target.value}
                          })}
                          placeholder="City"
                          className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={profile.address.postal_code}
                          onChange={(e) => setProfile({
                            ...profile, 
                            address: {...profile.address, postal_code: e.target.value}
                          })}
                          placeholder="Postal Code"
                          className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2 p-3 bg-gray-50 rounded-xl">
                      <p className="text-gray-900">{profile.address.line1}</p>
                      <p className="text-gray-900">{profile.address.line2}</p>
                      <p className="text-gray-900">{profile.address.city}, {profile.address.region}</p>
                      <p className="text-gray-900">{profile.address.postal_code}, {profile.address.country}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Driver's License */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Driver's License
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.driver_license.number}
                        onChange={(e) => setProfile({
                          ...profile, 
                          driver_license: {...profile.driver_license, number: e.target.value}
                        })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-xl">{profile.driver_license.number}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-xl">{profile.driver_license.class}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expires</label>
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-xl">{formatDate(profile.driver_license.expires_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${profile.driver_license.verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-sm text-gray-600">
                      {profile.driver_license.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferences & GDPR */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Preferences & Privacy
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    {isEditing ? (
                      <select
                        value={profile.preferences.currency}
                        onChange={(e) => setProfile({
                          ...profile, 
                          preferences: {...profile.preferences, currency: e.target.value}
                        })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="USD">USD</option>
                        <option value="ZWL">ZWL</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-xl">{profile.preferences.currency}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      checked={profile.gdpr.marketing_opt_in}
                      onChange={(e) => setProfile({
                        ...profile, 
                        gdpr: {...profile.gdpr, marketing_opt_in: e.target.checked}
                      })}
                      disabled={!isEditing}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700">
                      I agree to receive marketing communications
                    </label>
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

export default Profile;