import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminHeader from "@/components/admin/AdminHeader";
import LaptopStats from "@/components/admin/LaptopStats";
import LaptopManagement from "@/components/admin/LaptopManagement";

const Admin = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminLayout>
        <main role="main">
          <AdminHeader title="Admin Dashboard" />
          {/* Database Statistics */}
          <section className="bg-white shadow rounded-lg p-6 mb-6">
            <LaptopStats />
          </section>
          <LaptopManagement />
        </main>
      </AdminLayout>
    </div>
  );
};

export default Admin;
