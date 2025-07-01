# Code Companion: Ethical and Security Analysis Demo

This document provides examples of how Code Companion detects and reports various security, ethical, and compliance issues in code that traditional code editors might miss.

## Security Vulnerability Examples

### API Key Detection

```javascript
// This code would trigger a security warning
const apiKey = "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t";
fetch(`https://api.example.com/data?key=${apiKey}`)
  .then((response) => response.json())
  .then((data) => processData(data));
```

**Code Companion Analysis:**

- 🚨 **Security Issue (Line 2)**: Potential hardcoded API key detected. Storing sensitive information in code is a security risk.
- ✅ **Suggested Fix**: Use environment variables or a secure secrets manager to store API keys.

```javascript
// Improved version
const apiKey = process.env.API_KEY;
fetch(`https://api.example.com/data?key=${apiKey}`)
  .then((response) => response.json())
  .then((data) => processData(data));
```

### SQL Injection Vulnerability

```javascript
// This code would trigger a security warning
function getUserData(userId) {
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  return db.execute(query);
}
```

**Code Companion Analysis:**

- 🚨 **Security Issue (Line 3)**: Potential SQL injection vulnerability. Direct concatenation of user input in SQL queries is dangerous.
- ✅ **Suggested Fix**: Use parameterized queries to prevent SQL injection.

```javascript
// Improved version
function getUserData(userId) {
  const query = `SELECT * FROM users WHERE id = ?`;
  return db.execute(query, [userId]);
}
```

## Ethical Code Analysis Examples

### Algorithmic Bias Detection

```javascript
// This code would trigger an ethical warning
function calculateInsurancePremium(age, gender, zipCode) {
  let basePremium = 500;

  // Apply age multiplier
  if (age < 25) basePremium *= 1.5;

  // Apply gender factor
  if (gender === "male") basePremium *= 1.3;

  // Apply location factor based on zip code
  const zipFactors = { 90210: 1.5, 10001: 1.8, 60601: 1.2 };
  if (zipFactors[zipCode]) basePremium *= zipFactors[zipCode];

  return basePremium;
}
```

**Code Companion Analysis:**

- ⚠️ **Ethics Issue (Line 7)**: Code references gender which might need ethical review for bias. Using gender as a factor in insurance pricing may violate anti-discrimination laws in many jurisdictions.
- ⚠️ **Ethics Issue (Line 10-11)**: Zip code-based pricing may create indirect discrimination against protected groups due to residential segregation patterns.
- ✅ **Suggested Fix**: Consider alternative risk factors that don't correlate with protected characteristics or create unintended discrimination.

## Privacy Concerns

```javascript
// This code would trigger a privacy warning
function trackUserBehavior(user) {
  // Log all user actions
  document.addEventListener("click", (e) => {
    const data = {
      userId: user.id,
      timestamp: new Date().toISOString(),
      element: e.target.outerHTML,
      fullPath: window.location.href,
      ipAddress: user.ipAddress,
      deviceFingerprint: generateFingerprint(),
    };

    analytics.track("user_click", data);
  });
}
```

**Code Companion Analysis:**

- 🚨 **Privacy Issue (Line 8)**: Tracking the full HTML of clicked elements may inadvertently capture sensitive user data.
- 🚨 **Privacy Issue (Line 9-10)**: Collecting IP addresses and device fingerprinting without explicit consent may violate GDPR and other privacy regulations.
- ✅ **Suggested Fix**: Minimize data collection, anonymize where possible, and ensure proper consent mechanisms are in place.

## Accessibility Issues

```javascript
// This code would trigger an accessibility warning
function createColorPicker() {
  const container = document.createElement("div");

  const redInput = document.createElement("input");
  redInput.type = "range";
  redInput.min = 0;
  redInput.max = 255;

  const greenInput = document.createElement("input");
  greenInput.type = "range";
  greenInput.min = 0;
  greenInput.max = 255;

  const blueInput = document.createElement("input");
  blueInput.type = "range";
  blueInput.min = 0;
  blueInput.max = 255;

  const preview = document.createElement("div");
  preview.style.width = "50px";
  preview.style.height = "50px";

  container.appendChild(redInput);
  container.appendChild(greenInput);
  container.appendChild(blueInput);
  container.appendChild(preview);

  return container;
}
```

**Code Companion Analysis:**

- ⚠️ **Accessibility Issue (Line 4-6)**: Input elements lack proper labels, making them inaccessible to screen reader users.
- ⚠️ **Accessibility Issue (Line 21-24)**: Color selection has no text alternative, making it unusable for users with visual impairments.
- ✅ **Suggested Fix**: Add proper labels, ARIA attributes, and ensure color is not the only means of conveying information.

## Compliance Issues

```javascript
// This code would trigger compliance warnings
function saveUserPreferences(user, preferences) {
  // Store everything in localStorage for convenience
  localStorage.setItem(
    `user_${user.id}`,
    JSON.stringify({
      user: user,
      preferences: preferences,
      history: user.browsingHistory,
      location: user.geoLocation,
    })
  );

  // Share with partners
  if (user.country === "Germany" || user.country === "France") {
    // For EU users, check consent
    if (user.hasAcceptedPartnerSharing) {
      shareWithPartners(user);
    }
  } else {
    // For non-EU users, share by default
    shareWithPartners(user);
  }
}
```

**Code Companion Analysis:**

- 🚨 **Compliance Issue (Line 3-8)**: Storing user location and browsing history in localStorage without encryption may violate GDPR data protection requirements.
- 🚨 **Compliance Issue (Line 15-17)**: Different treatment of users based on country, with automatic data sharing for non-EU users, violates many privacy regulations including CCPA.
- ✅ **Suggested Fix**: Implement proper consent mechanisms for all users regardless of location, encrypt sensitive data, and limit data storage to what's necessary.

## How Code Companion Presents These Issues

For each identified issue, Code Companion provides:

1. **Categorization**: Issues are classified as security, ethics, privacy, accessibility, etc.
2. **Severity Level**: Critical security issues are highlighted differently than style suggestions
3. **Contextual Information**: Explanation of why the issue matters and potential impacts
4. **Suggested Fixes**: Code examples showing improved implementations
5. **Educational Content**: Links to best practices and regulatory information

This comprehensive approach helps developers write not just functional code, but code that is secure, ethical, and compliant with regulations.
