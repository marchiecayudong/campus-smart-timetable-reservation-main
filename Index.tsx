import Hero from "@/components/Hero";
import Features from "@/components/Features";
import EquipmentShowcase from "@/components/EquipmentShowcase";
import Benefits from "@/components/Benefits";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <EquipmentShowcase />
      <Benefits />
      <CTA />
      <Footer />
    </main>
  );
};

export default Index;
