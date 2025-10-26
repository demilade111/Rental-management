import { useLocation } from "react-router-dom";

const Header = ({ user, isLandlord }) => {
  const location = useLocation();
  const showGreeting = location.pathname === "/landlord/dashboard";

  return (
    <div className="bg-white px-8 py-6 flex justify-between items-center">
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

      <span className="text-sm text-gray-600">
        {isLandlord ? "Noti" : "Noti"}
      </span>
    </div>
  );
};

export default Header;
