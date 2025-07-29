# Tutor Hub - Sign Up System

## Overview
The Tutor Hub application now includes a comprehensive sign up and login system that allows users to register as either students or tutors.

## Features

### 1. Main Landing Page (`index.html`)
- **Language Selection**: Support for English and Hebrew
- **User Type Selection**: Choose between Student or Tutor
- **Sign Up Button**: Direct access to registration
- **Login Button**: Access to login page
- **Responsive Design**: Works on all device sizes

### 2. Registration Page (`pages/register.html`)
- **Dynamic Form**: Adapts based on user type (Student/Tutor)
- **Real-time Validation**: Instant feedback on form inputs
- **Password Requirements**: Minimum 6 characters
- **Email Validation**: Proper email format checking
- **Phone Validation**: International phone number support
- **Loading States**: Visual feedback during submission

### 3. Login Page (`pages/login.html`)
- **Simple Form**: Email and password only
- **Error Handling**: Clear error messages
- **Success Redirect**: Automatic navigation after login
- **Sign Up Link**: Easy access to registration

## User Flow

### New User Registration:
1. Visit the main page
2. Select language (English/Hebrew)
3. Choose user type (Student/Tutor)
4. Click "Sign Up" button
5. Fill out registration form
6. Submit and get redirected to appropriate dashboard

### Existing User Login:
1. Visit the main page
2. Click "Login" button
3. Enter email and password
4. Get redirected to appropriate dashboard

## Technical Implementation

### Frontend Files:
- `index.html` - Main landing page
- `pages/register.html` - Registration form
- `pages/login.html` - Login form
- `js/main.js` - Main application logic
- `js/register.js` - Registration functionality
- `js/login.js` - Login functionality
- `js/app.js` - API utilities and helpers
- `css/main.css` - Main styles
- `css/register.css` - Form styles

### Key Features:
- **Local Storage**: Token and user data persistence
- **API Integration**: RESTful API communication
- **Form Validation**: Client-side validation with real-time feedback
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Error Handling**: Comprehensive error management
- **Loading States**: Visual feedback during operations

## API Endpoints

### Registration:
```
POST /api/auth/register
Body: {
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  phone: string,
  city: string,
  userType: 'student' | 'tutor',
  specialty?: string, // for tutors
  learningGoal?: string, // for students
  languagePreference: 'en' | 'he'
}
```

### Login:
```
POST /api/auth/login
Body: {
  email: string,
  password: string
}
```

## Security Features

1. **Password Requirements**: Minimum 6 characters
2. **Email Validation**: Proper format checking
3. **Token-based Authentication**: JWT tokens for session management
4. **Input Sanitization**: Client-side validation
5. **Secure Storage**: Local storage for tokens

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Future Enhancements

1. **Social Login**: Google, Facebook integration
2. **Email Verification**: Account activation via email
3. **Password Reset**: Forgot password functionality
4. **Two-Factor Authentication**: Enhanced security
5. **Profile Completion**: Step-by-step profile setup
6. **Onboarding Flow**: Guided tour for new users

## Usage

1. Open `index.html` in a web browser
2. Select your preferred language
3. Choose whether you're a student or tutor
4. Click "Sign Up" to register or "Login" to sign in
5. Follow the on-screen instructions

## Development

To modify the sign up system:

1. Edit form fields in `pages/register.html`
2. Update validation in `js/register.js`
3. Modify styles in `css/main.css` and `css/register.css`
4. Update API endpoints in `js/app.js`
5. Test thoroughly across different devices and browsers 