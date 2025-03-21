# Solo Leveling Mobile App

A React Native mobile application with Firebase authentication, featuring a beautiful dark theme UI inspired by Solo Leveling.

## Features

- 🔐 Firebase Authentication
  - Email & Password Sign Up
  - Email & Password Login
  - Password Reset
  - Session Persistence
- 🎨 Beautiful UI/UX
  - Dark Theme with Purple Accents
  - Custom Icons
  - Gradient Backgrounds
  - Smooth Animations
  - Responsive Design
- 📱 Mobile-First Features
  - Keyboard Aware Scrolling
  - Safe Area Support
  - Cross-Platform (iOS & Android)
  - Loading States
  - Error Handling

## Tech Stack

- React Native
- Expo
- Firebase
- React Navigation
- Expo Linear Gradient
- React Native SVG

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- Firebase Account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/solo-leveling-app.git
cd solo-leveling-app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a Firebase project and add your configuration in `config/firebase.js`

4. Start the development server
```bash
npm start
# or
yarn start
```

5. Run on your device or emulator
- Scan the QR code with Expo Go (Android)
- Scan the QR code with Camera app (iOS)
- Press 'a' for Android emulator
- Press 'i' for iOS simulator

## Project Structure

```
solo-leveling-app/
├── App.js                # Main application component
├── components/           # Reusable components
│   └── Icons.tsx        # SVG icons
├── config/              # Configuration files
│   └── firebase.js      # Firebase setup
├── contexts/            # React contexts
│   └── AuthContext.js   # Authentication context
└── screens/             # Application screens
    ├── LoginScreen.js   # Login screen
    └── SignupScreen.js  # Signup screen
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- UI Design inspired by Solo Leveling
- Icons from Feather Icons
- Color palette from Tailwind CSS 