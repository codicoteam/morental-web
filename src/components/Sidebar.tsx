import {
  LayoutDashboard,
  Car,
  Calendar,
  User,
  LogOut,
  X,
  Users,
  PersonStandingIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ isOpen = true, onClose = () => {} }) => {
  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Car, label: "Vehicles", path: "/vehicless" },
    { icon: Calendar, label: "Bookings", path: "/bookings" },
    { icon: Users, label: "Customers", path: "/customers" },
    { icon: PersonStandingIcon, label: "Staff/Users", path: "/staff" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: LogOut, label: "Logout", path: "/logout" },
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 shadow-xl flex flex-col h-screen`}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between h-20 px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-500/30 flex items-center justify-center transform hover:scale-105 transition-transform duration-200">
                <Car className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-500 bg-clip-text text-transparent">
                AutoLink
              </span>
              <div className="text-xs text-gray-500 font-medium">
                car rental
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search vehicles..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1 flex-1 overflow-y-auto pb-6">
          {sidebarItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                    isActive
                      ? "text-white bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/30"
                      : "text-gray-600 hover:text-cyan-600 hover:bg-cyan-50"
                  }`
                }
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-r-full animate-slideIn"></div>
                    )}

                    {/* Icon container */}
                    <div
                      className={`relative p-2 rounded-lg mr-3 transition-all duration-200 ${
                        isActive
                          ? "text-white"
                          : "text-gray-500 group-hover:text-cyan-600"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <span className="relative">{item.label}</span>

                    {/* Hover effect */}
                    {!isActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer (optional) */}
        <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="text-xs text-gray-500 text-center">
            © 2024 AutoLink
          </div>
        </div>

        {/* Custom Animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideIn {
            from { transform: translateX(-100%) translateY(-50%); }
            to { transform: translateX(0) translateY(-50%); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
          
          .animate-slideIn {
            animation: slideIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </>
  );
};

export default Sidebar;
