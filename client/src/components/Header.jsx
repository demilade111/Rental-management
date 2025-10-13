const Header = ({ user, isLandlord }) => (
    <div className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">
            Good morning, {user?.firstName} {user?.lastName}!
        </h2>
        <span className="text-sm text-gray-600">
            {isLandlord ? 'Landlord Dashboard' : 'Tenant Dashboard'}
        </span>
    </div>
);

export default Header;
