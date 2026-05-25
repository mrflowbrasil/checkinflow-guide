import {
  Clock, LogOut, Wifi, MapPin, BookOpen, Wrench, Sofa, Building2,
  Car, Trash2, Zap, DoorOpen, Lightbulb, Phone, Siren, Navigation,
  Bus, Star, HelpCircle, UtensilsCrossed, Landmark, KeyRound, Hammer, Store,
  ConciergeBell, CalendarDays,
  type LucideIcon,
} from "lucide-react";

export const PAGE_ICONS: Record<string, LucideIcon> = {
  Clock, LogOut, Wifi, MapPin, BookOpen, Wrench, Sofa, Building2,
  Car, Trash2, Zap, DoorOpen, Lightbulb, Phone, Siren, Navigation,
  Bus, Star, HelpCircle, UtensilsCrossed, Landmark, KeyRound, Hammer, Store,
  ConciergeBell, CalendarDays,
};

export function getPageIcon(name: string): LucideIcon {
  return PAGE_ICONS[name] ?? HelpCircle;
}
