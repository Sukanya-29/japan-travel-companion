import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/japan/Nav";
import { Hero } from "@/components/japan/Hero";
import { Seasons } from "@/components/japan/Seasons";
import { Destinations } from "@/components/japan/Destinations";
import { Experiences } from "@/components/japan/Experiences";
import { Love } from "@/components/japan/Love";
import { IndiaGuide } from "@/components/japan/IndiaGuide";
import { FinalCta } from "@/components/japan/FinalCta";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nihon — Plan Your Dream Trip to Japan" },
      {
        name: "description",
        content:
          "Discover Japan: cherry blossoms, temples, neon cities and islands. Find the best time to visit and build a personalised Japan itinerary.",
      },
      { property: "og:title", content: "Nihon — Plan Your Dream Trip to Japan" },
      {
        property: "og:description",
        content:
          "Seasons, places and experiences across Japan, plus a personalised trip planner made for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
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
