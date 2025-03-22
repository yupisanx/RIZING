# Solo Mission Mobile App

A React Native mobile application for tracking personal growth and achievements in an RPG-style interface.

## Features

- User Authentication (Email/Password)
- Welcome Sequence for New Users
- Password Reset Functionality
- RPG-Style UI/UX
- Daily Training System
- Quest Management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Firebase account and project

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd [your-project-name]
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a Firebase project and add your configuration:
   - Create a new file `config/firebase.js`
   - Add your Firebase configuration

4. Start the development server:
```bash
npx expo start
```

## Environment Setup

Create a `.env` file in the root directory with the following variables:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
```

## Project Structure

```
src/
├── components/      # Reusable components
├── contexts/        # React Context providers
├── hooks/          # Custom hooks
├── screens/        # Screen components
├── config/         # Configuration files
└── navigation/     # Navigation setup
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details 