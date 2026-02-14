import React, { useState } from 'react';
import { Image, ImageProps, ImageStyle, StyleProp } from 'react-native';

interface SafeImageProps extends Omit<ImageProps, 'source'> {
    uri?: string;
    placeholder?: any;
    style?: StyleProp<ImageStyle>;
}

const SafeImage: React.FC<SafeImageProps> = ({ uri, placeholder, style, ...props }) => {
    const [error, setError] = useState(false);

    const defaultPlaceholder = require('../assets/images/placeholder-book.png');
    const source = (error || !uri) ? (placeholder || defaultPlaceholder) : { uri };

    return (
        <Image
            {...props}
            source={source}
            style={style}
            onError={() => {
                if (!error) setError(true);
            }}
        />
    );
};

export default SafeImage;
