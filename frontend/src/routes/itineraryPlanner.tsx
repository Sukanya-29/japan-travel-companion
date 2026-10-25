import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/japan/Nav";
import Itinerary from "../components/Itinerary/Itinerary";

export const Route = createFileRoute("/itineraryPlanner")({
  component: ItineraryPlanner,
});

function ItineraryPlanner() {
  return (
    <>
      <Nav />
      <Itinerary />
    </>
  );
}
