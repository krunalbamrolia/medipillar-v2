import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { AppProviders } from "./providers";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Products from "@/pages/Products";
import Contact from "@/pages/Contact";
import CompanyDetail from "@/pages/CompanyDetail";
import MedicineDetail from "@/pages/MedicineDetail";
import BecomePartner from "@/pages/BecomePartner";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import UserOrders from "@/pages/UserOrders";
import OrderSuccess from "@/pages/OrderSuccess";
import NotFound from "@/pages/not-found";

import AdminLogin from "@/pages/admin/Login";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminCategories from "@/pages/admin/Categories";
import AdminCompanies from "@/pages/admin/Companies";
import AdminMedicines from "@/pages/admin/Medicines";
import AdminOrders from "@/pages/admin/Orders";
import AdminUsers from "@/pages/admin/Users";
import AdminUserOrders from "@/pages/admin/UserOrders";
import AdminQueries from "@/pages/admin/Queries";

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/products" component={Products} />
      <Route path="/contact" component={Contact} />
      <Route path="/company/:id" component={CompanyDetail} />
      <Route path="/medicine/:id" component={MedicineDetail} />
      <Route path="/become-partner" component={BecomePartner} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/orders" component={UserOrders} />
      <Route path="/order-success/:id" component={OrderSuccess} />

      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard">
        {() => (
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/categories">
        {() => (
          <AdminLayout>
            <AdminCategories />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/companies">
        {() => (
          <AdminLayout>
            <AdminCompanies />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/medicines">
        {() => (
          <AdminLayout>
            <AdminMedicines />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/orders">
        {() => (
          <AdminLayout>
            <AdminOrders />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/users/:userId/orders">
        {() => (
          <AdminLayout>
            <AdminUserOrders />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/users">
        {() => (
          <AdminLayout>
            <AdminUsers />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/queries">
        {() => (
          <AdminLayout>
            <AdminQueries />
          </AdminLayout>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
    </>
  );
}

export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
