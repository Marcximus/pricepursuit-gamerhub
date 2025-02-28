
import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminHeader from "@/components/admin/AdminHeader";
import LaptopStats from "@/components/admin/LaptopStats";
import LaptopManagement from "@/components/admin/LaptopManagement";

const Admin = () => {
  return (
    <AdminLayout>
      <AdminHeader title="Admin Dashboard" />
      
      {/* Database Statistics */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <LaptopStats />
      </div>

      <LaptopManagement />
    </AdminLayout>
  );
};

export default Admin;
