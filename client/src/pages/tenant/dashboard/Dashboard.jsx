import { useAuthStore } from "../../../store/authStore";

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 p-4 md:p-6 lg:p-8">
        <h1>Tenant Dashboard</h1>
      </div>
    </>
  );
};

export default Dashboard;
