import {
  Folder, Archive, Box, Package, Bookmark, Tag, Hash, Inbox,
  Palette, PenTool, Film, Camera, Music, Headphones, Sparkles, Wand2,
  Code, Atom, Brain, Lightbulb, Telescope, Cpu, Globe, Zap,
  Heart, Coffee, Gamepad2, Dumbbell, Leaf, Mountain, Plane, Home,
  Briefcase, Building2, GraduationCap, Library, Target, Shield, Crown, Gem,
  Star, Rocket, Flame, Compass, Feather, Anchor, Moon, Sun,
  TrendingUp, BarChart, LineChart, Terminal, Bot, Share2, Brush, BookOpen, User, Users, Wallet, Trophy,
  type LucideIcon,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  Folder, Archive, Box, Package, Bookmark, Tag, Hash, Inbox,
  Palette, PenTool, Film, Camera, Music, Headphones, Sparkles, Wand2,
  Code, Atom, Brain, Lightbulb, Telescope, Cpu, Globe, Zap,
  Heart, Coffee, Gamepad2, Dumbbell, Leaf, Mountain, Plane, Home,
  Briefcase, Building2, GraduationCap, Library, Target, Shield, Crown, Gem,
  Star, Rocket, Flame, Compass, Feather, Anchor, Moon, Sun,
  TrendingUp, BarChart, LineChart, Terminal, Bot, Share2, Brush, BookOpen, User, Users, Wallet, Trophy,
};

export type IconName = keyof typeof ICON_MAP;

export function getEntityIcon(iconName?: string): LucideIcon {
  if (iconName && ICON_MAP[iconName]) {
    return ICON_MAP[iconName];
  }
  return Folder;
}
