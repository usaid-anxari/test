import { Link } from "react-router-dom";

const NavLink = ({ to, icon, label, onClick, isCollapsed }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group hover-lift`}
      title={isCollapsed ? label : undefined}
    >
      <span className="text-gray-500 group-hover:text-orange-600 group-hover:scale-110 transition-all duration-200">
        {icon}
      </span>
      {!isCollapsed && <span className="font-medium">{label}</span>}
    </Link>
  );
};

export default NavLink;
