# 📚 ReBookz Mobile App

Welcome to the **ReBookz** mobile application! 
ReBookz is a dedicated marketplace for buying, selling, renting, and swapping books in Saudi Arabia. 

This mobile app is built with **React Native (Expo)** to provide a smooth experience on both Android and iOS.

---

## 🚀 Features at a Glance

*   **Browse Books**: Search by category, title, or location.
*   **Buy & Sell**: List your old books for sale or find new treasures.
*   **Book Swapping**: Exchange books with others in your community.
*   **Favorites**: Save books you love for later.
*   **User Profiles**: Manage your listings and account details.
*   **Secure Auth**: Phone-based authentication (OTP) for easy login.
*   **Location Based**: Find books near you (Riyadh, Jeddah, etc.).

---

## 🛠️ Tech Stack

*   **Framework**: React Native (via Expo)
*   **Language**: TypeScript
*   **Navigation**: Expo Router (File-based routing)
*   **Styling**: Custom Styles (StyleSheet)
*   **Backend Communication**: Axios

---

## 🏁 How to Run Locally

### Prerequisites
*   Node.js installed on your machine.
*   (Optional) Expo Go app on your phone.

### Steps

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run the App**:
    ```bash
    npm start
    ```
    *(or `npx expo start`)*

3.  **Open on Device**:
    *   **Android**: Press `a` in the terminal (needs Android Emulator) OR scan the QR code with Expo Go.
    *   **iOS**: Press `i` (needs Mac + Xcode) OR scan the QR code with Expo Go camera.

---

## ⚙️ Configuration

The app connects to the **ReBookz Backend**.
If you are running the backend locally:
1.  Open `services/api.ts`.
2.  Update `SERVER_URL` to your machine's IP address (e.g., `http://192.168.1.5:5001`).

If you are using the live server:
1.  Update `SERVER_URL` to the live API link.

---

Happy Reading! 📖
