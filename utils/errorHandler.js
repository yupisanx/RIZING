import { Alert } from 'react-native';

class ErrorHandler {
  static handle(error, context = '') {
    console.error(`Error in ${context}:`, error);
    
    // Firebase specific errors
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          return 'This email is already registered. Please try logging in.';
        case 'auth/invalid-email':
          return 'Please enter a valid email address.';
        case 'auth/operation-not-allowed':
          return 'This operation is not allowed. Please contact support.';
        case 'auth/weak-password':
          return 'Please use a stronger password.';
        case 'auth/user-disabled':
          return 'This account has been disabled. Please contact support.';
        case 'auth/user-not-found':
          return 'No account found with this email.';
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.';
        case 'auth/too-many-requests':
          return 'Too many attempts. Please try again later.';
        case 'auth/network-request-failed':
          return 'Network error. Please check your connection.';
        default:
          return 'An unexpected error occurred. Please try again.';
      }
    }

    // Generic errors
    if (error.message) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  static showAlert(error, context = '') {
    const message = this.handle(error, context);
    Alert.alert('Error', message);
  }

  static log(error, context = '') {
    console.error(`[${context}]`, error);
  }
}

export default ErrorHandler; 