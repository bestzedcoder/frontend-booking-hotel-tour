import { Outlet } from "react-router-dom";
import { BusinessNavbar } from "../pages/business/BusinessNavbar";
import { BusinessSidebar } from "../pages/business/BusinessSidebar";

export const BusinessLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <BusinessSidebar />
      <div className="flex-1 md:ml-64 flex flex-col">
        <BusinessNavbar />
        <main className="flex-1 p-6 md:p-8 mt-16 overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default BusinessLayout;
