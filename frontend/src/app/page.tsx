import LandingHeader from "@/components/landing/LandingHeader";
import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import Services from "@/components/landing/Services";
import Pricing from "@/components/landing/Pricing";
import AfricaPresence from "@/components/landing/AfricaPresence";
import Testimonials from "@/components/landing/Testimonials";
import Contact from "@/components/landing/Contact";
import CTA from "@/components/landing/CTA";
import LandingFooter from "@/components/landing/LandingFooter";
import AiAssistant from "@/components/landing/AiAssistant";

// Page d'accueil (landing page) de BCX Finance
export default function Home() {
  return (
    <>
      <LandingHeader />
      <main>
        <Hero />
        <About />
        <Services />
        <Pricing />
        <AfricaPresence />
        <Testimonials />
        <Contact />
        <CTA />
      </main>
      <LandingFooter />
      <AiAssistant />
    </>
  );
}
