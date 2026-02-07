import { Platform } from 'react-native';

// Helper to create a fake JWT for backend decoding
const createMockJwt = (payload: any) => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = 'mock-signature';
    return `${header}.${body}.${signature}`;
};

let GoogleSignin: any = {
    configure: () => { console.log("GoogleSignin.configure mocked (Expo Go)"); },
    hasPlayServices: async () => { console.log("GoogleSignin mocked (Expo Go) - Play Services Check"); return true; },
    signIn: async () => {
        console.log("GoogleSignin mocked (Expo Go) - Signing In");

        // Return a mock user structure matching what the real library returns
        const mockUser = {
            id: 'mock-google-id-123',
            name: 'Expo Go User',
            email: 'expogo@test.com',
            photo: 'https://via.placeholder.com/150',
            familyName: 'User',
            givenName: 'Expo Go',
            idToken: createMockJwt({
                email: 'expogo@test.com',
                name: 'Expo Go User',
                picture: 'https://via.placeholder.com/150',
                sub: 'mock-google-id-123'
            })
        };

        return { data: mockUser };
    },
    signOut: async () => { console.warn("GoogleSignin mocked (Expo Go) - Signed Out"); },
};

try {
    // Try to import the real module
    // If it fails (NativeModule missing), we keep the mock
    const realModule = require('@react-native-google-signin/google-signin');
    // Check if the native module is actually linked/available
    if (realModule && realModule.GoogleSignin && realModule.GoogleSignin.signIn) {
        // Simple check: does it have the methods?
        GoogleSignin = realModule.GoogleSignin;
    }
} catch (error) {
    console.log("Running in Expo Go (or native module missing). Google Sign-In mocked.");
}

export { GoogleSignin };
