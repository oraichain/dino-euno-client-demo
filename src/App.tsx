// @ts-nocheck
import { useEffect } from "react";
import Layout from "./components/Layout";
import { AuthorizationProvider } from "./providers/AuthorizationProvider";
import AppRoutes from "./routes";

function App() {
  useEffect(() => {
    window.onload = async () => {
      if (!window.owallet) {
          alert("Please install owallet extension");
      } else {
          const chainId = "Oraichain";
          await window.owallet.enable(chainId);
      }
    }
  }, []);

  return (
    <AuthorizationProvider>
      <Layout>
        <AppRoutes />
      </Layout>
    </AuthorizationProvider>
  );
}

export default App;
