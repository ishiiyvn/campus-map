"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import BathroomIcon from "@mui/icons-material/Bathroom";
import ClassroomIcon from "@mui/icons-material/Class";
import DoorFrontIcon from "@mui/icons-material/DoorFront";
import ElevatorIcon from "@mui/icons-material/Elevator";
import GateIcon from "@mui/icons-material/ExitToApp";
import LabIcon from "@mui/icons-material/Science";
import LibraryIcon from "@mui/icons-material/LocalLibrary";
import OfficeIcon from "@mui/icons-material/Business";
import ParkingIcon from "@mui/icons-material/LocalParking";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import StairsIcon from "@mui/icons-material/Stairs";
import WifiIcon from "@mui/icons-material/Wifi";
import AccessibleIcon from "@mui/icons-material/Accessible";
import CafeteriaIcon from "@mui/icons-material/LocalCafe";
import ComputerIcon from "@mui/icons-material/Computer";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import FitnessIcon from "@mui/icons-material/FitnessCenter";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PhoneIcon from "@mui/icons-material/Phone";
import PlaceIcon from "@mui/icons-material/Place";
import SchoolIcon from "@mui/icons-material/School";
import ShowerIcon from "@mui/icons-material/Shower";
import WorkIcon from "@mui/icons-material/Work";

const ICONS: { name: string; component: React.ComponentType<{ className?: string }> }[] = [
  { name: "Bathroom", component: BathroomIcon },
  { name: "Classroom", component: ClassroomIcon },
  { name: "Door", component: DoorFrontIcon },
  { name: "Elevator", component: ElevatorIcon },
  { name: "Gate", component: GateIcon },
  { name: "Lab", component: LabIcon },
  { name: "Library", component: LibraryIcon },
  { name: "Office", component: OfficeIcon },
  { name: "Parking", component: ParkingIcon },
  { name: "Restaurant", component: RestaurantIcon },
  { name: "Stairs", component: StairsIcon },
  { name: "Wifi", component: WifiIcon },
  { name: "Accessible", component: AccessibleIcon },
  { name: "Cafeteria", component: CafeteriaIcon },
  { name: "Computer", component: ComputerIcon },
  { name: "Walking", component: DirectionsWalkIcon },
  { name: "Seating", component: EventSeatIcon },
  { name: "Gym", component: FitnessIcon },
  { name: "Health", component: LocalHospitalIcon },
  { name: "Meeting", component: MeetingRoomIcon },
  { name: "Phone", component: PhoneIcon },
  { name: "Place", component: PlaceIcon },
  { name: "School", component: SchoolIcon },
  { name: "Shower", component: ShowerIcon },
  { name: "Work", component: WorkIcon },
];

interface IconPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (iconName: string) => void;
  selectedIcon?: string | null;
}

export function IconPicker({
  open,
  onOpenChange,
  onSelect,
  selectedIcon,
}: IconPickerProps) {
  const [search, setSearch] = React.useState("");

  const filteredIcons = ICONS.filter((icon) =>
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Icon</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="grid grid-cols-6 gap-2 max-h-[300px] overflow-y-auto">
            {filteredIcons.map((icon) => {
              const IconComponent = icon.component;
              const isSelected = selectedIcon === icon.name;
              return (
                <button
                  key={icon.name}
                  onClick={() => {
                    onSelect(icon.name);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "flex items-center justify-center p-2 rounded-md border transition-colors hover:bg-accent",
                    isSelected && "border-primary bg-primary/10"
                  )}
                  title={icon.name}
                >
                  <IconComponent className="size-6" />
                </button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No icons found
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function getIconComponent(name: string): React.ComponentType<{ className?: string }> | null {
  const icon = ICONS.find((i) => i.name === name);
  return icon?.component ?? null;
}

export { ICONS };

// Render an icon by name. Declared at module scope to avoid creating components during
// render in consumer components (which can trigger the `react-hooks/static-components` rule).
export function IconByName({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  if (!name) return null;
  switch (name) {
    case "Bathroom":
      return <BathroomIcon className={className} />;
    case "Classroom":
      return <ClassroomIcon className={className} />;
    case "Door":
      return <DoorFrontIcon className={className} />;
    case "Elevator":
      return <ElevatorIcon className={className} />;
    case "Gate":
      return <GateIcon className={className} />;
    case "Lab":
      return <LabIcon className={className} />;
    case "Library":
      return <LibraryIcon className={className} />;
    case "Office":
      return <OfficeIcon className={className} />;
    case "Parking":
      return <ParkingIcon className={className} />;
    case "Restaurant":
      return <RestaurantIcon className={className} />;
    case "Stairs":
      return <StairsIcon className={className} />;
    case "Wifi":
      return <WifiIcon className={className} />;
    case "Accessible":
      return <AccessibleIcon className={className} />;
    case "Cafeteria":
      return <CafeteriaIcon className={className} />;
    case "Computer":
      return <ComputerIcon className={className} />;
    case "Walking":
      return <DirectionsWalkIcon className={className} />;
    case "Seating":
      return <EventSeatIcon className={className} />;
    case "Gym":
      return <FitnessIcon className={className} />;
    case "Health":
      return <LocalHospitalIcon className={className} />;
    case "Meeting":
      return <MeetingRoomIcon className={className} />;
    case "Phone":
      return <PhoneIcon className={className} />;
    case "Place":
      return <PlaceIcon className={className} />;
    case "School":
      return <SchoolIcon className={className} />;
    case "Shower":
      return <ShowerIcon className={className} />;
    case "Work":
      return <WorkIcon className={className} />;
    default:
      return null;
  }
}
