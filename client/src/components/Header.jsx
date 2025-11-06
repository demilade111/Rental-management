import { useLocation } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";

const Header = ({ user, isLandlord }) => {
  const location = useLocation();
  const showGreeting =
    location.pathname === "/landlord/dashboard" ||
    location.pathname === "/tenant/dashboard";

  return (
    <div className="px-8 py-6 flex justify-between items-center">
      {showGreeting ? (
        <h2 className="text-[16px] text-gray-900">
          Good morning,{" "}
          <span className="font-semibold">
            {user?.firstName} {user?.lastName}!
          </span>
        </h2>
      ) : (
        <div />
      )}

      <NotificationDropdown />
    </div>
  );
};

export default Header;
