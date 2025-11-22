# Biometric Settings - Product Requirements Documentation

## Document Information
- **Document Version**: 1.0
- **Last Updated**: 2025-11-22
- **Epic**: EPIC-PROFILE-006 - Biometric Settings
- **Related Components**: `BiometricSettings`, `BiometricSetup`, `BiometricInput`, `SobrietyDashboard`
- **Database Tables**: `user_biometrics`, `biometric_readings`, `drinking_sessions`, `sobriety_alerts`
- **Native Requirements**: Capacitor for mobile biometric APIs

---

## Executive Summary

The Biometric Settings section enables Pours Consumer users to configure biometric authentication for secure access and set up biometric monitoring for responsible alcohol consumption tracking. This dual-purpose feature enhances security through fingerprint/Face ID authentication while promoting user safety through real-time health monitoring during drinking sessions. The feature requires native mobile capabilities through Capacitor for full biometric sensor access.

---

## Epic Definition

### EPIC-PROFILE-006: Biometric Settings

**Epic Description**: As a Pours Consumer user, I need to configure biometric authentication and health monitoring settings so that I can secure my account with modern authentication methods and participate in responsible drinking monitoring programs when consuming alcoholic beverages.

**Business Value**:
- Enhances account security with biometric authentication
- Reduces friction in authentication through fingerprint/Face ID
- Promotes responsible drinking through health monitoring
- Demonstrates corporate social responsibility
- Provides legal protection through consumption tracking
- Differentiates app with safety-focused features
- Reduces liability through proactive intervention
- Builds trust with health-conscious consumers

**Success Metrics**:
- Biometric auth adoption: > 65% of mobile users
- Login time reduction: > 70% with biometrics
- Sobriety monitoring opt-in: > 40% of users
- Intervention success rate: > 85% of alerts heeded
- User satisfaction with security: > 4.5/5
- False positive rate for biometrics: < 1%
- User retention with safety features: > 80%

---

## Technical Prerequisites

### Native Mobile Requirements

**IMPORTANT**: Biometric features require native mobile capabilities:

1. **Capacitor Setup Required**:
   - Install @capacitor/core, @capacitor/cli, @capacitor/ios, @capacitor/android
   - Initialize Capacitor with `npx cap init`
   - Configure native platforms with `npx cap add ios` and `npx cap add android`
   - Sync after changes with `npx cap sync`

2. **Biometric Plugins**:
   - [@capacitor/biometric-auth](https://capacitorjs.com/docs/apis/biometric-auth) for authentication
   - [capacitor-health-kit](https://github.com/Ad-Scientiam/capacitor-health-kit) for iOS health data
   - [capacitor-google-fit](https://github.com/perfood/capacitor-google-fit) for Android health data

3. **Platform Requirements**:
   - iOS: Face ID/Touch ID (iOS 11+), HealthKit access
   - Android: Fingerprint/Face unlock (Android 6+), Google Fit access

4. **Permissions Required**:
   - iOS: NSFaceIDUsageDescription, NSHealthShareUsageDescription
   - Android: USE_BIOMETRIC, BODY_SENSORS, ACTIVITY_RECOGNITION

---

## User Stories

### US-BIOMETRIC.1: Enable Biometric Authentication

**Story**: As a Pours Consumer user, I want to enable biometric authentication (fingerprint or Face ID) so that I can log in quickly and securely without typing my password every time.

**Priority**: High  
**Story Points**: 8  
**Dependencies**: Capacitor, @capacitor/biometric-auth plugin, device biometric hardware

#### Acceptance Criteria

```gherkin
Feature: Enable Biometric Authentication
  Epic: EPIC-PROFILE-006 - Biometric Settings

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Biometric Settings"
    And my device supports biometric authentication

  Scenario: Check device biometric capability
    When I view the Biometric Settings page
    Then the system should detect my device's biometric capabilities
    And if Face ID is available, I should see "Face ID" option
    And if Fingerprint is available, I should see "Fingerprint" option
    And if no biometrics available, I should see "Not supported on this device"

  Scenario: Enable biometric authentication for the first time
    Given biometric authentication is disabled
    When I toggle "Enable Biometric Authentication" on
    Then I should see a confirmation dialog
    And the dialog should explain "Use [Face ID/Fingerprint] to sign in quickly and securely"
    When I confirm
    Then the device biometric prompt should appear
    When I successfully authenticate with biometrics
    Then biometric authentication should be enabled
    And I should see "Biometric authentication enabled"
    And my device should be registered

  Scenario: System verification of biometric capability
    Given I attempt to enable biometric authentication
    When the device has no biometrics enrolled
    Then I should see an error "No biometrics enrolled on this device"
    And I should see instructions to enroll in device settings
    And the toggle should remain off

  Scenario: Biometric authentication during login
    Given I have biometric authentication enabled
    And I am logged out
    When I reach the login screen
    Then I should see a "Sign in with [Face ID/Fingerprint]" button
    When I tap the button
    Then the biometric prompt should appear
    When I authenticate successfully
    Then I should be logged in immediately
    And I should be redirected to the main page

  Scenario: Fallback to password
    Given I am on the biometric login screen
    When I tap "Use Password Instead"
    Then I should see the password login form
    And I should be able to log in with my password

  Scenario: Failed biometric authentication
    Given I attempt to log in with biometrics
    When the biometric authentication fails
    Then I should see "Authentication failed. Try again?"
    And I should have options to:
      | Try Again            |
      | Use Password Instead |
    And after 3 failed attempts, I should be required to use password

  Scenario: Biometric re-authentication for sensitive actions
    Given I am logged in with biometrics
    When I attempt to change my password
    Then I should be prompted to re-authenticate with biometrics
    And only after successful authentication can I proceed

  Scenario: Disable biometric authentication
    Given biometric authentication is enabled
    When I toggle "Enable Biometric Authentication" off
    Then I should see a confirmation "Disable biometric login?"
    When I confirm
    Then I should be required to authenticate with biometrics one last time
    And biometric authentication should be disabled
    And I should see "You'll need to use your password to sign in"
```

#### Technical Requirements

**Capacitor Biometric Auth Integration**:
```typescript
import { BiometricAuth } from '@capacitor/biometric-auth';

// Check biometric availability
const checkBiometricAvailability = async () => {
  try {
    const result = await BiometricAuth.checkBiometry();
    return {
      available: result.isAvailable,
      biometryType: result.biometryType, // 'faceId', 'touchId', 'fingerprint', 'none'
      strongBiometryAvailable: result.strongBiometryAvailable
    };
  } catch (error) {
    console.error('Biometric check failed:', error);
    return { available: false };
  }
};

// Authenticate with biometrics
const authenticateWithBiometrics = async () => {
  try {
    await BiometricAuth.authenticate({
      reason: 'Authenticate to access Pours+',
      cancelTitle: 'Cancel',
      allowDeviceCredential: false,
      iosFallbackTitle: 'Use Password',
      androidTitle: 'Biometric Authentication',
      androidSubtitle: 'Verify your identity',
      androidConfirmationRequired: false
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Store biometric preference
const enableBiometricAuth = async (userId: string, deviceId: string) => {
  // First, authenticate to verify biometrics work
  const authResult = await authenticateWithBiometrics();
  if (!authResult.success) {
    throw new Error('Biometric authentication failed');
  }
  
  // Store preference in Supabase
  await supabase
    .from('profiles')
    .update({
      biometric_enabled: true,
      biometric_device_id: deviceId,
      biometric_enrolled_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  // Store encrypted token in secure storage
  await SecureStorage.set({
    key: 'biometric_token',
    value: await generateBiometricToken(userId)
  });
};
```

**Login Flow with Biometrics**:
```typescript
const loginWithBiometrics = async () => {
  // Check if biometrics enabled
  const { data: profile } = await supabase
    .from('profiles')
    .select('biometric_enabled, user_id')
    .eq('user_id', currentUserId)
    .single();
  
  if (!profile?.biometric_enabled) {
    throw new Error('Biometric authentication not enabled');
  }
  
  // Authenticate with device biometrics
  const authResult = await authenticateWithBiometrics();
  if (!authResult.success) {
    throw new Error('Biometric authentication failed');
  }
  
  // Retrieve and validate token
  const { value: token } = await SecureStorage.get({ key: 'biometric_token' });
  
  // Sign in with token
  const { data, error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: token // Use securely stored token
  });
  
  return { data, error };
};
```

**Database Schema Addition**:
```sql
-- Add biometric fields to profiles table
ALTER TABLE profiles 
ADD COLUMN biometric_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN biometric_device_id TEXT,
ADD COLUMN biometric_enrolled_at TIMESTAMP WITH TIME ZONE;

-- Create index for quick lookup
CREATE INDEX idx_profiles_biometric_enabled 
ON profiles(user_id, biometric_enabled);
```

---

### US-BIOMETRIC.2: Manage Biometric Devices

**Story**: As a Pours Consumer user, I want to manage which devices are enrolled for biometric authentication so that I can control access and remove lost or old devices.

**Priority**: High  
**Story Points**: 5  
**Dependencies**: Device identification, biometric enrollment tracking

#### Acceptance Criteria

```gherkin
Feature: Manage Biometric Devices
  Epic: EPIC-PROFILE-006 - Biometric Settings

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Biometric Settings" > "Enrolled Devices"

  Scenario: View enrolled devices
    Given I have biometric authentication enabled on 2 devices
    When I view enrolled devices
    Then I should see a list of 2 devices
    And each device should display:
      | Device Name          | (e.g., "iPhone 14 Pro")    |
      | Biometric Type       | (Face ID, Fingerprint)      |
      | Enrolled Date        | (Nov 22, 2025)             |
      | Last Used            | (2 hours ago)              |
      | Current Device Badge | (if current device)        |
    And I should see a "Remove" button for each device

  Scenario: Device identification
    When I enroll a new device
    Then the device should be identified by:
      | Device Model     |
      | OS Version       |
      | Device ID        |
      | Biometric Type   |
    And the device should be given a friendly name

  Scenario: Current device indicator
    Given I am viewing enrolled devices
    Then my current device should be clearly marked
    And it should show "This Device" badge
    And it should not have a "Remove" button

  Scenario: Remove enrolled device
    Given I have multiple devices enrolled
    When I click "Remove" on a device
    Then I should see a confirmation dialog
    And the dialog should show which device will be removed
    When I confirm
    Then I should be prompted to authenticate with biometrics
    When I authenticate successfully
    Then the device should be removed from enrolled devices
    And biometric login should be disabled on that device
    And I should see "Device removed successfully"

  Scenario: Maximum devices limit
    Given I have reached the maximum of 5 enrolled devices
    When I attempt to enroll a new device
    Then I should see "Maximum devices reached (5/5)"
    And I should see "Remove a device to add a new one"
    And the enrollment should be blocked

  Scenario: Remove all devices
    Given I have multiple devices enrolled
    When I click "Remove All Devices"
    Then I should see a warning dialog
    And the dialog should say "This will disable biometric login on all devices"
    When I confirm and authenticate
    Then all devices should be removed
    And biometric authentication should be disabled
    And I should see "Biometric authentication disabled on all devices"

  Scenario: Suspicious device detection
    Given a new device location is detected during enrollment
    When the location is significantly different from previous devices
    Then I should see a security alert
    And I should be required to verify via email
    And the enrollment should be pending until verified
```

#### Technical Requirements

**Device Information Collection**:
```typescript
import { Device } from '@capacitor/device';

const getDeviceInfo = async () => {
  const info = await Device.getInfo();
  const id = await Device.getId();
  
  return {
    deviceId: id.identifier,
    platform: info.platform, // 'ios' or 'android'
    model: info.model,
    osVersion: info.osVersion,
    manufacturer: info.manufacturer,
    name: info.name || `${info.manufacturer} ${info.model}`,
    biometricType: await getBiometricType()
  };
};

// Store enrolled device
const enrollDevice = async (userId: string) => {
  const deviceInfo = await getDeviceInfo();
  
  // Check device limit
  const { count } = await supabase
    .from('enrolled_devices')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  if (count >= 5) {
    throw new Error('Maximum devices reached');
  }
  
  // Store device
  const { data, error } = await supabase
    .from('enrolled_devices')
    .insert({
      user_id: userId,
      device_id: deviceInfo.deviceId,
      device_name: deviceInfo.name,
      device_model: deviceInfo.model,
      platform: deviceInfo.platform,
      os_version: deviceInfo.osVersion,
      biometric_type: deviceInfo.biometricType,
      last_used: new Date().toISOString()
    });
  
  return { data, error };
};

// Remove device
const removeDevice = async (deviceId: string, userId: string) => {
  // Require biometric authentication
  const authResult = await authenticateWithBiometrics();
  if (!authResult.success) {
    throw new Error('Authentication required');
  }
  
  // Remove from database
  await supabase
    .from('enrolled_devices')
    .delete()
    .eq('device_id', deviceId)
    .eq('user_id', userId);
  
  // If current device, clear local storage
  const currentDevice = await getDeviceInfo();
  if (currentDevice.deviceId === deviceId) {
    await SecureStorage.remove({ key: 'biometric_token' });
  }
};
```

**Database Schema**:
```sql
-- Create enrolled_devices table
CREATE TABLE enrolled_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT NOT NULL,
  device_model TEXT,
  platform TEXT NOT NULL,
  os_version TEXT,
  biometric_type TEXT NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, device_id)
);

-- Enable RLS
ALTER TABLE enrolled_devices ENABLE ROW LEVEL SECURITY;

-- Users can manage their own devices
CREATE POLICY "Users can manage own devices"
ON enrolled_devices FOR ALL
USING (auth.uid() = user_id);

-- Index for quick lookup
CREATE INDEX idx_enrolled_devices_user 
ON enrolled_devices(user_id, is_active);
```

---

### US-BIOMETRIC.3: Configure Biometric Security Preferences

**Story**: As a Pours Consumer user, I want to configure when biometric authentication is required so that I can balance security with convenience based on my preferences.

**Priority**: Medium  
**Story Points**: 5  
**Dependencies**: Biometric authentication system

#### Acceptance Criteria

```gherkin
Feature: Configure Biometric Security Preferences
  Epic: EPIC-PROFILE-006 - Biometric Settings

  Background:
    Given I am logged in as a Pours Consumer user
    And I have biometric authentication enabled
    And I navigate to "Biometric Settings" > "Security Preferences"

  Scenario: Configure when biometrics are required
    When I view security preferences
    Then I should see options to require biometrics for:
      | App Launch                | Always, After 5 min, After 15 min, Never |
      | Payments                  | Always Required                          |
      | Profile Changes           | Toggle on/off                            |
      | Sensitive Actions         | Toggle on/off                            |
      | Order Placement           | Toggle on/off                            |
    And "Payments" should be locked to "Always Required"

  Scenario: Set biometric requirement for app launch
    Given "App Launch" is set to "After 5 minutes"
    When I close the app
    And I reopen it within 5 minutes
    Then I should not be prompted for biometrics
    When I reopen it after 5 minutes
    Then I should be prompted for biometric authentication

  Scenario: Require biometrics for profile changes
    Given "Profile Changes" is enabled
    When I attempt to update my email address
    Then I should be prompted for biometric authentication
    And only after successful authentication can I proceed

  Scenario: Require biometrics for sensitive actions
    Given "Sensitive Actions" is enabled
    When I attempt to view saved payment methods
    Then I should be prompted for biometric authentication
    When authentication succeeds
    Then I can view my payment methods

  Scenario: Grace period setting
    Given I want to reduce authentication frequency
    When I set "App Launch" to "After 15 minutes"
    Then I should see "You won't need to authenticate for 15 minutes after closing the app"
    And the setting should be saved
    And my biometric prompt frequency should decrease

  Scenario: Mandatory biometric for payments
    Given I have biometric authentication enabled
    When I attempt to complete a payment
    Then I must authenticate with biometrics
    And there should be no option to disable this requirement
    And I should see "Biometric authentication required for security"

  Scenario: Fallback options
    When I view security preferences
    Then I should see "Fallback to Password" toggle
    When I enable fallback
    Then failed biometric attempts should offer password option
    When I disable fallback
    Then only biometrics will be accepted (max 3 attempts, then lockout)
```

#### Technical Requirements

**Security Preferences Storage**:
```typescript
interface BiometricPreferences {
  appLaunchTimeout: number; // minutes (0 = always, -1 = never)
  requireForPayments: boolean; // always true
  requireForProfileChanges: boolean;
  requireForSensitiveActions: boolean;
  requireForOrders: boolean;
  allowPasswordFallback: boolean;
  maxFailedAttempts: number;
}

const defaultPreferences: BiometricPreferences = {
  appLaunchTimeout: 5,
  requireForPayments: true, // Cannot be changed
  requireForProfileChanges: true,
  requireForSensitiveActions: true,
  requireForOrders: false,
  allowPasswordFallback: true,
  maxFailedAttempts: 3
};

// Save preferences
const saveSecurityPreferences = async (
  userId: string,
  preferences: Partial<BiometricPreferences>
) => {
  // Ensure payments always require biometrics
  preferences.requireForPayments = true;
  
  await supabase
    .from('profiles')
    .update({ biometric_preferences: preferences })
    .eq('user_id', userId);
};

// Check if biometric required for action
const isBiometricRequired = async (
  action: 'appLaunch' | 'payment' | 'profileChange' | 'sensitiveAction' | 'order'
): Promise<boolean> => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('biometric_preferences, biometric_enabled')
    .eq('user_id', currentUserId)
    .single();
  
  if (!profile?.biometric_enabled) return false;
  
  const prefs = profile.biometric_preferences as BiometricPreferences;
  
  switch (action) {
    case 'appLaunch':
      if (prefs.appLaunchTimeout === -1) return false; // Never
      if (prefs.appLaunchTimeout === 0) return true;   // Always
      // Check last authentication time
      const lastAuth = await getLastAuthTime();
      const minutesSince = (Date.now() - lastAuth) / 60000;
      return minutesSince >= prefs.appLaunchTimeout;
    
    case 'payment':
      return true; // Always required
    
    case 'profileChange':
      return prefs.requireForProfileChanges;
    
    case 'sensitiveAction':
      return prefs.requireForSensitiveActions;
    
    case 'order':
      return prefs.requireForOrders;
    
    default:
      return false;
  }
};
```

---

### US-BIOMETRIC.4: Setup Biometric Health Monitoring

**Story**: As a Pours Consumer user, I want to set up biometric health monitoring so that I can track my vitals during drinking sessions and receive alerts if my readings are concerning.

**Priority**: High  
**Story Points**: 13  
**Dependencies**: Health data permissions, native health APIs, `user_biometrics`, `biometric_readings` tables

#### Acceptance Criteria

```gherkin
Feature: Setup Biometric Health Monitoring
  Epic: EPIC-PROFILE-006 - Biometric Settings

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Biometric Settings" > "Health Monitoring"

  Scenario: Initial health monitoring setup
    Given I have never set up health monitoring
    When I view the health monitoring section
    Then I should see an explanation of what data is collected:
      | Heart Rate              |
      | Blood Pressure          |
      | Oxygen Saturation       |
      | Body Temperature        |
    And I should see "Why we collect this data"
    And I should see privacy assurances
    And I should see an "Enable Monitoring" button

  Scenario: Provide baseline biometric data
    When I click "Enable Monitoring"
    Then I should be prompted to enter baseline data:
      | Weight (kg)                |
      | Height (cm)                |
      | Gender                     |
      | Body Fat % (optional)      |
    And I should see "This helps us calculate accurate BAC"
    When I submit the data
    Then it should be stored securely
    And I should proceed to permission request

  Scenario: Request health data permissions (iOS)
    Given I am on an iOS device
    When I proceed with monitoring setup
    Then I should see Apple HealthKit permission request
    And the request should specify:
      | Heart Rate              | Read access |
      | Blood Pressure          | Read access |
      | Oxygen Saturation       | Read access |
      | Body Temperature        | Read access |
    When I grant permission
    Then health monitoring should be enabled
    And I should see "Health monitoring enabled"

  Scenario: Request health data permissions (Android)
    Given I am on an Android device
    When I proceed with monitoring setup
    Then I should see Google Fit permission request
    And required permissions should be listed
    When I grant permission
    Then health monitoring should be enabled

  Scenario: Deny health data permissions
    When I deny health data permissions
    Then I should see "Permission required for health monitoring"
    And I should see "You can enable this later in device settings"
    And health monitoring should remain disabled
    And I should see a link to device settings

  Scenario: Enable automatic data collection
    Given I have granted health permissions
    When I enable "Automatic Data Collection"
    Then the app should read health data every 5 minutes during sessions
    And I should see "Data will be collected automatically during drinking sessions"

  Scenario: Manual biometric input option
    Given I don't want to use automatic collection
    When I toggle "Manual Input" on
    Then I should see "You'll need to manually enter vitals during sessions"
    And I should be able to test manual input
    And manual input fields should appear during sessions

  Scenario: Configure monitoring alerts
    When I enable health monitoring
    Then I should see alert threshold settings:
      | Heart Rate              | > 120 BPM (High)          |
      | Heart Rate              | < 50 BPM (Low)            |
      | Blood Pressure          | > 140/90 mmHg (High)      |
      | Oxygen Saturation       | < 92% (Low)               |
      | Estimated BAC           | > 0.08% (Legal Limit)     |
    And I should be able to customize thresholds
    And I should see recommended vs custom values

  Scenario: Privacy and data retention
    When I view privacy settings
    Then I should see:
      | Who can see my data     | Only me                  |
      | Data retention          | 90 days                  |
      | Share with venues       | Toggle (off by default)  |
      | Export my data          | Button                   |
      | Delete all data         | Button                   |
    And I should be able to export/delete data
```

#### Technical Requirements

**Health Data Integration (iOS)**:
```typescript
import { HealthKit } from '@capacitor-community/health-kit';

// Request HealthKit permissions
const requestHealthPermissions = async () => {
  try {
    const permissions = await HealthKit.requestAuthorization({
      read: [
        'HKQuantityTypeIdentifierHeartRate',
        'HKQuantityTypeIdentifierBloodPressureSystolic',
        'HKQuantityTypeIdentifierBloodPressureDiastolic',
        'HKQuantityTypeIdentifierOxygenSaturation',
        'HKQuantityTypeIdentifierBodyTemperature'
      ],
      write: []
    });
    
    return permissions;
  } catch (error) {
    console.error('HealthKit permission error:', error);
    throw error;
  }
};

// Read health data
const readHealthData = async (type: string, startDate: Date, endDate: Date) => {
  const result = await HealthKit.queryQuantitySamples({
    sampleType: type,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    limit: 100
  });
  
  return result.samples;
};

// Monitor heart rate during session
const monitorHeartRate = async (sessionId: string, userId: string) => {
  const startTime = new Date();
  const interval = setInterval(async () => {
    try {
      const samples = await readHealthData(
        'HKQuantityTypeIdentifierHeartRate',
        new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        new Date()
      );
      
      if (samples.length > 0) {
        const latestReading = samples[samples.length - 1];
        
        // Store reading
        await supabase
          .from('biometric_readings')
          .insert({
            user_id: userId,
            session_id: sessionId,
            heart_rate: latestReading.quantity,
            recorded_at: latestReading.startDate,
            source: 'HealthKit'
          });
        
        // Check thresholds
        await checkHealthThresholds(userId, latestReading.quantity, 'heart_rate');
      }
    } catch (error) {
      console.error('Heart rate monitoring error:', error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
  
  return interval;
};
```

**Health Data Integration (Android)**:
```typescript
import { GoogleFit } from '@perfood/capacitor-google-fit';

// Request Google Fit permissions
const requestFitPermissions = async () => {
  try {
    await GoogleFit.requestPermission({
      scopes: [
        { name: 'heartRate', accessType: 'read' },
        { name: 'bloodPressure', accessType: 'read' },
        { name: 'oxygenSaturation', accessType: 'read' },
        { name: 'bodyTemperature', accessType: 'read' }
      ]
    });
    
    return { success: true };
  } catch (error) {
    console.error('Google Fit permission error:', error);
    throw error;
  }
};

// Read heart rate from Google Fit
const readHeartRateFromFit = async (startDate: Date, endDate: Date) => {
  const result = await GoogleFit.query({
    startTime: startDate.getTime(),
    endTime: endDate.getTime(),
    dataType: 'com.google.heart_rate.bpm'
  });
  
  return result.dataPoints;
};
```

**Store User Biometrics Baseline**:
```typescript
const storeBaselineBiometrics = async (
  userId: string,
  data: {
    weight_kg: number;
    height_cm: number;
    gender: string;
    body_fat_percentage?: number;
  }
) => {
  const { error } = await supabase
    .from('user_biometrics')
    .upsert({
      user_id: userId,
      weight_kg: data.weight_kg,
      height_cm: data.height_cm,
      gender: data.gender,
      body_fat_percentage: data.body_fat_percentage,
      updated_at: new Date().toISOString()
    });
  
  if (error) throw error;
  
  // Enable monitoring in profile
  await supabase
    .from('profiles')
    .update({
      health_monitoring_enabled: true,
      health_monitoring_enrolled_at: new Date().toISOString()
    })
    .eq('user_id', userId);
};
```

**Alert Threshold Checking**:
```typescript
const checkHealthThresholds = async (
  userId: string,
  value: number,
  metric: 'heart_rate' | 'blood_pressure' | 'oxygen_saturation'
) => {
  // Get user's threshold settings
  const { data: settings } = await supabase
    .from('profiles')
    .select('health_alert_thresholds')
    .eq('user_id', userId)
    .single();
  
  const thresholds = settings?.health_alert_thresholds || DEFAULT_THRESHOLDS;
  
  let alertType: string | null = null;
  let message = '';
  
  switch (metric) {
    case 'heart_rate':
      if (value > thresholds.heart_rate_max) {
        alertType = 'high_heart_rate';
        message = `Your heart rate is elevated (${value} BPM). Consider slowing down.`;
      } else if (value < thresholds.heart_rate_min) {
        alertType = 'low_heart_rate';
        message = `Your heart rate is low (${value} BPM). Please seek assistance.`;
      }
      break;
    
    case 'oxygen_saturation':
      if (value < thresholds.oxygen_saturation_min) {
        alertType = 'low_oxygen';
        message = `Your oxygen levels are low (${value}%). Please get fresh air.`;
      }
      break;
  }
  
  if (alertType) {
    // Create sobriety alert
    await supabase
      .from('sobriety_alerts')
      .insert({
        user_id: userId,
        alert_type: alertType,
        message: message,
        estimated_bac: await getCurrentEstimatedBAC(userId)
      });
    
    // Send push notification
    await sendPushNotification(userId, message);
  }
};
```

---

### US-BIOMETRIC.5: Monitor Health During Drinking Sessions

**Story**: As a Pours Consumer user, I want my health vitals monitored during drinking sessions so that I can be alerted if my readings become concerning and make informed decisions about my consumption.

**Priority**: High  
**Story Points**: 13  
**Dependencies**: Active health monitoring, drinking session tracking

#### Acceptance Criteria

```gherkin
Feature: Monitor Health During Drinking Sessions
  Epic: EPIC-PROFILE-006 - Biometric Settings

  Background:
    Given I am logged in as a Pours Consumer user
    And I have health monitoring enabled
    And I have checked in at a venue

  Scenario: Automatic session start detection
    Given I have placed my first alcoholic drink order
    When the order is confirmed
    Then a drinking session should automatically start
    And I should see "Session Started - Health monitoring active"
    And health data collection should begin
    And I should see my current vitals displayed

  Scenario: Real-time vitals dashboard during session
    Given I am in an active drinking session
    When I view the session dashboard
    Then I should see real-time vitals:
      | Current Heart Rate          | 78 BPM (Normal)       |
      | Estimated BAC               | 0.04% (Moderate)      |
      | Time Since Last Drink       | 15 minutes            |
      | Drinks This Session         | 3                     |
      | Session Duration            | 1 hour 30 min         |
      | Recommendation              | Slow down pace        |
    And vitals should update every 5 minutes
    And visual indicators should show if values are normal/concerning

  Scenario: Receive alert for high heart rate
    Given my heart rate exceeds 120 BPM
    When the reading is recorded
    Then I should see an urgent notification
    And the notification should say "Your heart rate is elevated. Consider slowing down or taking a break."
    And I should see recommended actions:
      | Drink water                |
      | Take a break               |
      | Eat food                   |
      | End session                |
    And the alert should be logged

  Scenario: Receive alert for concerning BAC
    Given my estimated BAC exceeds 0.08%
    When the calculation is updated
    Then I should see a warning notification
    And the notification should say "You've reached the legal limit. Please stop drinking."
    And I should see options to:
      | Call a ride (Uber/Lyft)    |
      | Call a friend              |
      | View nearby transportation |
      | End session                |
    And venue staff may be notified (if consent given)

  Scenario: Acknowledge health alert
    Given I receive a health alert
    When I view the alert
    Then I should be able to acknowledge it
    And I should see "How are you feeling?" with options:
      | Good - I'll be careful     |
      | Concerned - I'll stop      |
      | Need help                  |
    When I select an option
    Then my response should be recorded
    And appropriate follow-up action should occur

  Scenario: Manual vital input during session
    Given automatic collection is not available
    When I am prompted to enter vitals
    Then I should see easy input fields:
      | Heart Rate (BPM)           | Numeric keypad    |
      | How do you feel?           | Scale 1-5         |
    When I submit readings
    Then they should be recorded
    And I should see "Reading recorded - Thank you"

  Scenario: Session recommendations based on data
    Given I have been drinking for 2 hours
    And my BAC is 0.06%
    When I view session insights
    Then I should see personalized recommendations:
      | "Take a 30-minute break"                  |
      | "Drink 2 glasses of water"                |
      | "Eat a snack"                             |
      | "Your BAC will be 0.03% in 1.5 hours"     |
    And recommendations should update as vitals change

  Scenario: End drinking session
    When I click "End Session"
    Then I should see a session summary:
      | Total drinks                | 4                      |
      | Session duration            | 2 hours 15 min         |
      | Peak BAC                    | 0.07%                  |
      | Average heart rate          | 82 BPM                 |
      | Alerts received             | 2                      |
      | Time until sober            | 2 hours estimated      |
    And health monitoring should stop
    And I should receive sobriety tips

  Scenario: Share session data with venue (opt-in)
    Given I have consented to venue data sharing
    When a concerning alert is triggered
    Then venue staff should receive a discreet notification
    And they should see which table needs attention
    And no personal health details should be shared
    And I should see "Venue notified - staff may check on you"
```

#### Technical Requirements

**Session Monitoring Loop**:
```typescript
class DrinkingSessionMonitor {
  private sessionId: string;
  private userId: string;
  private monitoringInterval: NodeJS.Timer | null = null;
  
  async startSession(userId: string, venueId: string) {
    // Create session
    const { data: session } = await supabase
      .from('drinking_sessions')
      .insert({
        user_id: userId,
        venue_id: venueId,
        started_at: new Date().toISOString(),
        status: 'active'
      })
      .select()
      .single();
    
    this.sessionId = session.id;
    this.userId = userId;
    
    // Start monitoring
    this.startMonitoring();
    
    return session;
  }
  
  private startMonitoring() {
    this.monitoringInterval = setInterval(async () => {
      await this.collectAndAnalyzeVitals();
    }, 5 * 60 * 1000); // Every 5 minutes
  }
  
  private async collectAndAnalyzeVitals() {
    try {
      // Read health data from device
      const vitals = await this.readCurrentVitals();
      
      // Store reading
      await supabase
        .from('biometric_readings')
        .insert({
          user_id: this.userId,
          session_id: this.sessionId,
          heart_rate: vitals.heartRate,
          blood_pressure_systolic: vitals.bpSystolic,
          blood_pressure_diastolic: vitals.bpDiastolic,
          oxygen_saturation: vitals.oxygenSat,
          temperature_celsius: vitals.temperature,
          recorded_at: new Date().toISOString(),
          source: 'automatic'
        });
      
      // Update session with current BAC
      await this.updateSessionBAC();
      
      // Check for alerts
      await this.checkVitalThresholds(vitals);
      
    } catch (error) {
      console.error('Monitoring error:', error);
    }
  }
  
  private async updateSessionBAC() {
    // Call Edge Function to calculate BAC
    await supabase.rpc('update_session_bac', {
      session_id_param: this.sessionId
    });
  }
  
  private async checkVitalThresholds(vitals: any) {
    const alerts = [];
    
    if (vitals.heartRate > 120) {
      alerts.push({
        type: 'high_heart_rate',
        severity: 'warning',
        message: 'Your heart rate is elevated. Consider slowing down.'
      });
    }
    
    // Get current BAC
    const { data: session } = await supabase
      .from('drinking_sessions')
      .select('estimated_bac')
      .eq('id', this.sessionId)
      .single();
    
    if (session?.estimated_bac >= 0.08) {
      alerts.push({
        type: 'legal_limit',
        severity: 'critical',
        message: "You've reached the legal limit. Please stop drinking."
      });
    }
    
    // Create alerts
    for (const alert of alerts) {
      await supabase
        .from('sobriety_alerts')
        .insert({
          user_id: this.userId,
          session_id: this.sessionId,
          alert_type: alert.type,
          message: alert.message,
          estimated_bac: session?.estimated_bac || 0
        });
      
      // Send push notification
      await this.sendAlertNotification(alert);
    }
  }
  
  async endSession() {
    // Stop monitoring
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    // Update session
    await supabase
      .from('drinking_sessions')
      .update({
        ended_at: new Date().toISOString(),
        status: 'completed'
      })
      .eq('id', this.sessionId);
  }
}
```

---

## Non-Functional Requirements

### Security
- Biometric data never leaves device (processed locally)
- Health readings encrypted at rest and in transit
- Biometric tokens stored in secure storage only
- No screenshots allowed on biometric screens
- Session timeout after failed attempts

### Performance
- Biometric authentication response: < 2 seconds
- Health data sync: Every 5 minutes during sessions
- Alert notification: < 5 seconds from threshold breach
- Session start/end: < 1 second

### Privacy
- HIPAA compliance for health data
- Explicit consent for each data type
- User can export all health data
- User can delete all health data
- Venue data sharing opt-in only
- Anonymized data for analytics only

### Usability
- Clear explanations of what data is collected
- Visual indicators for alert severity
- Easy-to-understand health metrics
- Accessible to users with disabilities
- Offline capability for manual input

### Reliability
- Graceful degradation if health API unavailable
- Manual input fallback always available
- Session data preserved if app crashes
- Alert retry logic for failed notifications

---

## Success Metrics & KPIs

### Adoption
- Biometric auth adoption: > 65% of mobile users
- Health monitoring opt-in: > 40% of users
- Device enrollment rate: > 80% of biometric users

### Engagement
- Active monitoring sessions: > 50% of drinking sessions
- Alert acknowledgment rate: > 90%
- Manual input usage: < 20% (indicates good automation)

### Safety
- Intervention success rate: > 85% of users heed alerts
- Legal limit exceedances: < 5% with monitoring vs 15% without
- Venue incident reduction: > 40%

### User Satisfaction
- Security perception: > 4.5/5
- Feature usefulness: > 4.3/5
- Privacy trust: > 4.4/5

---

## Traceability Matrix

| User Story | Epic | Scenarios | Test Cases | Components |
|-----------|------|-----------|------------|------------|
| US-BIOMETRIC.1 | EPIC-PROFILE-006 | 8 | TC-BIO-001 to TC-BIO-008 | BiometricAuth |
| US-BIOMETRIC.2 | EPIC-PROFILE-006 | 6 | TC-BIO-009 to TC-BIO-014 | DeviceManagement |
| US-BIOMETRIC.3 | EPIC-PROFILE-006 | 6 | TC-BIO-015 to TC-BIO-020 | SecurityPreferences |
| US-BIOMETRIC.4 | EPIC-PROFILE-006 | 10 | TC-BIO-021 to TC-BIO-030 | BiometricSetup |
| US-BIOMETRIC.5 | EPIC-PROFILE-006 | 9 | TC-BIO-031 to TC-BIO-039 | SessionMonitoring |

---

## Future Enhancements

### Phase 2
- **Wearable Integration**: Apple Watch, Fitbit, Garmin
- **Advanced Metrics**: Stress levels, hydration, sleep quality
- **Social Features**: Anonymous comparison with peers
- **Machine Learning**: Personalized BAC prediction
- **Voice Commands**: Siri/Google Assistant integration

### Phase 3
- **Breathalyzer Integration**: Bluetooth breathalyzer support
- **Emergency Contacts**: Auto-notify if critical threshold
- **Insurance Integration**: Share data for lower premiums
- **Medical Professional Access**: Opt-in data sharing with doctor

---

## Appendix

### Related Documentation
- [Manage Profile Features](./manage-profile-features.md)
- [Privacy Policy](../privacy-policy.md)
- [Sobriety Monitoring Epic](../epics/sobriety-monitoring.md)

### Capacitor Setup Guide
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Biometric Auth Plugin](https://capacitorjs.com/docs/apis/biometric-auth)
- [Lovable Capacitor Guide](https://docs.lovable.dev/tips-tricks/capacitor)

### Change Log
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-22 | Product Team | Initial documentation created |

---

**Document Status**: Approved  
**Last Review Date**: 2025-11-22  
**Next Review Date**: 2026-02-22  

**IMPORTANT NOTE**: This feature requires Capacitor setup for native mobile capabilities. Biometric authentication and health monitoring will only work on native iOS/Android apps, not in web browsers. See Capacitor setup instructions at: https://docs.lovable.dev/tips-tricks/capacitor
