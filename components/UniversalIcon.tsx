import React from 'react';
import { Ionicons, Feather, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

interface UniversalIconProps {
    name: string;
    size?: number;
    color?: string;
}

/**
 * Dynamically converts CamelCase (often used in react-icons) to kebab-case (often used in Expo/Ionicons).
 */
const toKebabCase = (str: string) =>
    str.replace(/[A-Z]/g, (letter, index) =>
        index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`
    );

/**
 * Maps specific icon names from react-icons/io5 to Expo-compatible Ionicons or Feather icons.
 */
const ICON_MAP: Record<string, { set: any; name: string }> = {
    'IoBookOutline': { set: Ionicons, name: 'book-outline' },
    'IoLibraryOutline': { set: Ionicons, name: 'library-outline' },
    'IoSchoolOutline': { set: Ionicons, name: 'school-outline' },
    'IoBriefcaseOutline': { set: Ionicons, name: 'briefcase-outline' },
    'IoCodeSlashOutline': { set: Ionicons, name: 'code-slash-outline' },
    'IoFlaskOutline': { set: Ionicons, name: 'flask-outline' },
    'IoEarthOutline': { set: Ionicons, name: 'earth-outline' },
    'IoColorPaletteOutline': { set: Ionicons, name: 'color-palette-outline' },
    'IoFitnessOutline': { set: Ionicons, name: 'fitness-outline' },
    'IoRestaurantOutline': { set: Ionicons, name: 'restaurant-outline' },
    'IoMedkitOutline': { set: Ionicons, name: 'medkit-outline' },
    'IoCarOutline': { set: Ionicons, name: 'car-outline' },
    'IoGameControllerOutline': { set: Ionicons, name: 'game-controller-outline' },
    'IoJournalOutline': { set: Ionicons, name: 'journal-outline' },
    'IoLocateOutline': { set: Ionicons, name: 'locate-outline' },
    'IoLogoElectron': { set: MaterialCommunityIcons, name: 'atom' },
    'IoCalculatorOutline': { set: Ionicons, name: 'calculator-outline' },
    'IoGlobeOutline': { set: Ionicons, name: 'globe-outline' },
    'IoBusinessOutline': { set: Ionicons, name: 'business-outline' },
    'IoSettingsOutline': { set: Ionicons, name: 'settings-outline' },
    'IoBookmarkOutline': { set: Ionicons, name: 'bookmark-outline' },
    'IoDocumentTextOutline': { set: Ionicons, name: 'document-text-outline' },
    'IoLeafOutline': { set: Ionicons, name: 'leaf-outline' },
    'IoHeartOutline': { set: Ionicons, name: 'heart-outline' },
    'IoSearchOutline': { set: Ionicons, name: 'search-outline' },
    'IoStarOutline': { set: Ionicons, name: 'star-outline' },
    'IoRocketOutline': { set: Ionicons, name: 'rocket-outline' },
    'IoHardwareChipOutline': { set: Ionicons, name: 'hardware-chip-outline' },
    'IoShirtOutline': { set: Ionicons, name: 'shirt-outline' },
    'IoImageOutline': { set: Ionicons, name: 'image-outline' },
    'IoHappyOutline': { set: Ionicons, name: 'happy-outline' },
    'IoChatbubbleEllipsesOutline': { set: Ionicons, name: 'chatbubble-ellipses-outline' },
    'IoFolderOutline': { set: Ionicons, name: 'folder-outline' },

    // Legacy short names mapping
    'book': { set: Ionicons, name: 'book-outline' },
    'library': { set: Ionicons, name: 'library-outline' },
    'school': { set: Ionicons, name: 'school-outline' },
    'business': { set: Ionicons, name: 'briefcase-outline' },
    'code': { set: Ionicons, name: 'code-slash-outline' },
    'flask': { set: Ionicons, name: 'flask-outline' },
    'earth': { set: Ionicons, name: 'earth-outline' },
    'color-palette': { set: Ionicons, name: 'color-palette-outline' },
    'fitness': { set: Ionicons, name: 'fitness-outline' },
    'restaurant': { set: Ionicons, name: 'restaurant-outline' },
    'medical': { set: Ionicons, name: 'medkit-outline' },
    'car': { set: Ionicons, name: 'car-outline' },
    'game-controller': { set: Ionicons, name: 'game-controller-outline' },
    'notebook': { set: Ionicons, name: 'journal-outline' },
    'target': { set: Ionicons, name: 'locate-outline' },
    'graduation-cap': { set: Ionicons, name: 'school-outline' },
    'atom': { set: MaterialCommunityIcons, name: 'atom' },
    'calculator': { set: Ionicons, name: 'calculator-outline' },
    'globe': { set: Ionicons, name: 'globe-outline' },
    'government': { set: Ionicons, name: 'business-outline' },
    'gear': { set: Ionicons, name: 'settings-outline' },
    'bookmark': { set: Ionicons, name: 'bookmark-outline' },
    'file-text': { set: Ionicons, name: 'document-text-outline' },
    'feather': { set: Ionicons, name: 'leaf-outline' },
    'heart': { set: Ionicons, name: 'heart-outline' },
    'search': { set: Ionicons, name: 'search-outline' },
    'sparkles': { set: Ionicons, name: 'star-outline' },
    'rocket': { set: Ionicons, name: 'rocket-outline' },
    'cpu': { set: Ionicons, name: 'hardware-chip-outline' },
    'shirt': { set: Ionicons, name: 'shirt-outline' },
    'briefcase': { set: Ionicons, name: 'briefcase-outline' },
    'image': { set: Ionicons, name: 'image-outline' },
    'smile': { set: Ionicons, name: 'happy-outline' },
    'comic': { set: Ionicons, name: 'chatbubble-ellipses-outline' }
};

export default function UniversalIcon({ name, size = 24, color = '#000' }: UniversalIconProps) {
    // 1. Check exact map first (case sensitive for Io... names)
    if (ICON_MAP[name]) {
        const { set: IconSet, name: iconName } = ICON_MAP[name];
        return <IconSet name={iconName as any} size={size} color={color} />;
    }

    // 2. Dynamic resolution
    let resolvedName = name;

    // Remove Io prefix
    if (resolvedName.startsWith('Io')) {
        resolvedName = resolvedName.substring(2);
    }

    // Handle Outline suffix
    if (resolvedName.endsWith('Outline')) {
        resolvedName = toKebabCase(resolvedName.replace('Outline', '')) + '-outline';
    } else {
        resolvedName = toKebabCase(resolvedName);
    }

    // Fallback chain
    return <Ionicons name={resolvedName as any} size={size} color={color} />;
}
