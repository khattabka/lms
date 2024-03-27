import React from "react";
import Sidebar from "./_components/sidebar";
import Navbar from "~/app/(dashboard)/_components/navbar/navbar";

const DashBoardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      {/* NAVBAR */}
      <div className="fixed inset-y-0 top-0 z-50 h-20 w-full md:pl-56">
        <Navbar />
      </div>
      {/* SIDEBAR */}
      <div className="fixed inset-y-0 z-50 hidden  h-full w-56 flex-col md:flex ">
        <Sidebar />
      </div>
      <main className="md:pl-56 pt-20">{children}</main>
    </div>
  );
};

export default DashBoardLayout;
