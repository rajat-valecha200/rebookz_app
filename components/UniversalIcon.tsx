import React from 'react';
import { Ionicons, Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

interface UniversalIconProps {
    name: string;
    size?: number;
    color?: string;
}

/**
 * Maps common icon names from various sets to a consistent standard.
 * This ensures that if the admin picks 'book' or 'notebook', we show something valid.
 */
const iconMapping: Record<string, { set: any; name: string }> = {
    // Common mappings
    'book': { set: Ionicons, name: 'book-outline' },
    'book-open': { set: Ionicons, name: 'book-outline' },
    'school': { set: Ionicons, name: 'school-outline' },
    'notebook': { set: Feather, name: 'book' },
    'library': { set: Ionicons, name: 'library-outline' },
    'newspaper': { set: Ionicons, name: 'newspaper-outline' },
    'magazine': { set: Ionicons, name: 'newspaper-outline' },
    'happy': { set: Ionicons, name: 'happy-outline' },
    'child': { set: FontAwesome5, name: 'child' },
    'target': { set: Feather, name: 'target' },
    'atom': { set: FontAwesome5, name: 'atom' },
    'calculator': { set: Ionicons, name: 'calculator-outline' },
    'globe': { set: Ionicons, name: 'globe-outline' },
    'government': { set: Ionicons, name: 'business-outline' },
    'business': { set: Ionicons, name: 'business-outline' },
    'gear': { set: Ionicons, name: 'construct-outline' },
    'construct': { set: Ionicons, name: 'construct-outline' },
    'medical': { set: Ionicons, name: 'medkit-outline' },
    'medkit': { set: Ionicons, name: 'medkit-outline' },
    'bookmark': { set: Ionicons, name: 'bookmark-outline' },
    'file-text': { set: Ionicons, name: 'document-text-outline' },
    'document-text': { set: Ionicons, name: 'document-text-outline' },
    'feather': { set: Feather, name: 'feather' },
    'rose': { set: Ionicons, name: 'flower-outline' },
    'heart': { set: Ionicons, name: 'heart-outline' },
    'search': { set: Ionicons, name: 'search-outline' },
    'sparkles': { set: Ionicons, name: 'sparkles-outline' },
    'planet': { set: Ionicons, name: 'planet-outline' },
    'rocket': { set: Ionicons, name: 'rocket-outline' },
    'cpu': { set: Feather, name: 'cpu' },
    'hardware-chip': { set: Ionicons, name: 'hardware-chip-outline' },
    'shirt': { set: Ionicons, name: 'shirt-outline' },
    'briefcase': { set: Ionicons, name: 'briefcase-outline' },
    'image': { set: Ionicons, name: 'image-outline' },
    'smile': { set: Ionicons, name: 'happy-outline' },
    'comic': { set: Ionicons, name: 'chatbubbles-outline' },
    'chatbubbles': { set: Ionicons, name: 'chatbubbles-outline' },
    'brush': { set: Ionicons, name: 'brush-outline' },
    'pencil': { set: Ionicons, name: 'pencil-outline' },
    'easel': { set: Ionicons, name: 'easel-outline' },
    'color-palette': { set: Ionicons, name: 'color-palette-outline' },
    'color-wand': { set: Ionicons, name: 'color-wand-outline' },
    'trophy': { set: Ionicons, name: 'trophy-outline' },
};

export default function UniversalIcon({ name, size = 24, color = '#000' }: UniversalIconProps) {
    const mapping = iconMapping[name.toLowerCase()];

    if (mapping) {
        const IconSet = mapping.set;
        return <IconSet name={mapping.name as any} size={size} color={color} />;
    }

    // Fallback chain if not in mapping
    // Try Ionicons first, then Feather
    return <Ionicons name={name as any} size={size} color={color} />;
}
