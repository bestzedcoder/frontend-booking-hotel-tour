import Navbar from "../components/Navbar";

export const CustomerLayout = ({ children }) => {
  return (
    <div>
      <main className="p-4">{children}</main>
    </div>
  );
};
