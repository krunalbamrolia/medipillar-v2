import { useEffect, lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { AppProviders } from "./providers";
import { Loader2 } from "lucide-react";

const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Products = lazy(() => import("@/pages/Products"));
const Contact = lazy(() => import("@/pages/Contact"));
const CompanyDetail = lazy(() => import("@/pages/CompanyDetail"));
const MedicineDetail = lazy(() => import("@/pages/MedicineDetail"));
const BecomePartner = lazy(() => import("@/pages/BecomePartner"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const UserOrders = lazy(() => import("@/pages/UserOrders"));
const OrderSuccess = lazy(() => import("@/pages/OrderSuccess"));
const NotFound = lazy(() => import("@/pages/not-found"));

const AdminLogin = lazy(() => import("@/pages/admin/Login"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminCategories = lazy(() => import("@/pages/admin/Categories"));
const AdminCompanies = lazy(() => import("@/pages/admin/Companies"));
const AdminMedicines = lazy(() => import("@/pages/admin/Medicines"));
const AdminOrders = lazy(() => import("@/pages/admin/Orders"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AdminUserOrders = lazy(() => import("@/pages/admin/UserOrders"));
const AdminQueries = lazy(() => import("@/pages/admin/Queries"));

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-[#0d3d2e]" />
  </div>
);

function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
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
      </Suspense>
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
