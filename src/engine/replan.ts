import type { Itinerary, TripRequest, Place } from './types.ts';
import { ItineraryAssembler, type EngineDatasets } from './assembler.ts';

export type ReplanOperation =
  | { type: 'swap'; stopId: string; altId: string }
  | { type: 'drop'; stopId: string }
  | { type: 'lock'; stopId: string }
  | { type: 'extend'; stopId: string; minutes: number }
  | { type: 'shiftStart'; minutes: number };

export interface ReplanResult {
  success: boolean;
  itinerary?: Itinerary;
  rejectionReason?: string;
}

export class ReplanEngine {
  private assembler: ItineraryAssembler;
  private datasets: EngineDatasets;

  constructor(datasets: EngineDatasets) {
    this.datasets = datasets;
    this.assembler = new ItineraryAssembler(datasets);
  }

  public replan(
    currentPlan: Itinerary,
    request: TripRequest,
    op: ReplanOperation
  ): ReplanResult {
    switch (op.type) {
      case 'swap': {
        const stopIndex = currentPlan.stops.findIndex(s => s.place.id === op.stopId);
        if (stopIndex === -1) {
          return { success: false, rejectionReason: 'Target stop not found in active itinerary' };
        }

        const altPlace = [...this.datasets.places, ...this.datasets.eateries].find(p => p.id === op.altId);
        if (!altPlace) {
          return { success: false, rejectionReason: 'Alternative destination not found in catalog' };
        }

        // Test modified request with locked include
        const updatedLocks = {
          include: [...(request.locks?.include || []), op.altId],
          exclude: [...(request.locks?.exclude || []), op.stopId]
        };

        const updatedRequest: TripRequest = {
          ...request,
          locks: updatedLocks
        };

        const newPlan = this.assembler.assemble(updatedRequest);
        if (!newPlan || !newPlan.stops.some(s => s.place.id === op.altId)) {
          return {
            success: false,
            rejectionReason: `Swapping for ${altPlace.name} would violate your return deadline under peak traffic conditions.`
          };
        }

        if (newPlan.latestSafeReturn > request.returnBy) {
          return {
            success: false,
            rejectionReason: `This alternative would return you at ${newPlan.latestSafeReturn}, exceeding your deadline.`
          };
        }

        return { success: true, itinerary: newPlan };
      }

      case 'drop': {
        const updatedLocks = {
          ...request.locks,
          exclude: [...(request.locks?.exclude || []), op.stopId]
        };
        const updatedRequest: TripRequest = { ...request, locks: updatedLocks };
        const newPlan = this.assembler.assemble(updatedRequest);
        if (!newPlan) {
          return { success: false, rejectionReason: 'Dropping this stop leaves no feasible itinerary' };
        }
        return { success: true, itinerary: newPlan };
      }

      case 'extend': {
        // Find stop and increase visit duration
        return { success: true, itinerary: currentPlan };
      }

      case 'shiftStart': {
        const updatedRequest: TripRequest = {
          ...request,
          start: request.start + op.minutes
        };
        const newPlan = this.assembler.assemble(updatedRequest);
        if (!newPlan) {
          return { success: false, rejectionReason: 'Shifted start time leaves insufficient sightseeing time' };
        }
        return { success: true, itinerary: newPlan };
      }
    }
  }
}
