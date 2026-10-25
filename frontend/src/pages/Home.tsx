import { Nav } from "@/components/japan/Nav";
import { Hero } from "@/components/japan/Hero";
import { Seasons } from "@/components/japan/Seasons";
import { Destinations } from "@/components/japan/Destinations";
import { Experiences } from "@/components/japan/Experiences";
import { Love } from "@/components/japan/Love";
import { IndiaGuide } from "@/components/japan/IndiaGuide";
import { FinalCta } from "@/components/japan/FinalCta";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Seasons />
      <Destinations />
      <Experiences />
      <IndiaGuide />
      <Love />
      <FinalCta />
    </main>
  );
}
