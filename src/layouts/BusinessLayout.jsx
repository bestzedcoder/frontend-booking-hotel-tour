export const BusinessLayout = ({ children }) => {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-100 min-h-screen p-4">
        <h2 className="font-bold text-lg mb-4">Business Panel</h2>
        {/* thêm menu business ở đây */}
      </aside>
      <main className="flex-1 p-6 bg-white">{children}</main>
    </div>
  );
};
