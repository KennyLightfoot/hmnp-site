import {
  Award,
  Building,
  Calendar,
  CheckCircle,
  Clipboard,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  FileSignature,
  FileText,
  Globe,
  Home,
  Key,
  MapPin,
  Shield,
  User,
  Users,
  type LucideIcon,
} from "lucide-react"

type IconName =
  | "award"
  | "building"
  | "calendar"
  | "checkCircle"
  | "clipboard"
  | "clock"
  | "copy"
  | "creditCard"
  | "dollarSign"
  | "fileSignature"
  | "fileText"
  | "globe"
  | "home"
  | "key"
  | "mapPin"
  | "shield"
  | "user"
  | "users"

const iconMap: Record<IconName, LucideIcon> = {
  award: Award,
  building: Building,
  calendar: Calendar,
  checkCircle: CheckCircle,
  clipboard: Clipboard,
  clock: Clock,
  copy: Copy,
  creditCard: CreditCard,
  dollarSign: DollarSign,
  fileSignature: FileSignature,
  fileText: FileText,
  globe: Globe,
  home: Home,
  key: Key,
  mapPin: MapPin,
  shield: Shield,
  user: User,
  users: Users,
}

export function getIconByName(name: string): LucideIcon | null {
  return iconMap[name as IconName] || null
}

