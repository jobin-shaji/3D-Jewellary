import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function Layout({ children }) {
    if (!Header || !Footer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading components...</div>
      </div>
    );
  }
  return (
    <div className="app">
      <Header />
      <main>{children}</main>
      <Footer />

    </div>
  );
}
