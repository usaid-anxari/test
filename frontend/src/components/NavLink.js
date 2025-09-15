import { Link } from "react-router-dom";

const NavLink = ({ to, icon, label, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center px-4 py-2 text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
    >
      {icon}
      <span className="ml-3">{label}</span>
    </Link>
  );
};

export default NavLink;
