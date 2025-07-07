# Contact Form Setup Guide

## Option 1: Google Forms (Recommended for Quick Setup)

### Step 1: Create Google Form
1. Go to [forms.google.com](https://forms.google.com)
2. Create a new form with these fields:
   - Name (Short answer)
   - Email (Short answer)
   - Company (Short answer)
   - Industry (Multiple choice - use your existing options)
   - Message (Paragraph)
3. In form settings, enable "Collect email addresses"
4. Set up email notifications to your Google Workspace email

### Step 2: Embed the Form
Replace the current form HTML with an iframe:

```html
<div class="contact-form-container">
    <iframe 
        src="YOUR_GOOGLE_FORM_URL/viewform?embedded=true" 
        width="100%" 
        height="600" 
        frameborder="0" 
        marginheight="0" 
        marginwidth="0">
        Loading…
    </iframe>
</div>
```

## Option 2: Formspree (Free Tier Available)

### Step 1: Sign Up
1. Go to [formspree.io](https://formspree.io)
2. Create free account
3. Create a new form
4. Get your form endpoint URL

### Step 2: Update HTML
Replace the form action with Formspree endpoint:

```html
<form class="contact-form scroll-animate form-slide" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
    <!-- existing form fields stay the same -->
</form>
```

## Option 3: Netlify Forms (If Using Netlify Hosting)

### Step 1: Update Form
Add Netlify attributes to your existing form:

```html
<form class="contact-form scroll-animate form-slide" name="contact" method="POST" data-netlify="true">
    <input type="hidden" name="form-name" value="contact" />
    <!-- existing form fields stay the same -->
</form>
```

### Step 2: Configure Notifications
In Netlify dashboard, set up email notifications to your Google Workspace email.

## Option 4: Custom JavaScript with EmailJS

### Step 1: Sign Up for EmailJS
1. Go to [emailjs.com](https://emailjs.com)
2. Create account
3. Set up email service (Gmail)
4. Create email template

### Step 2: Add JavaScript
Add this script to handle form submission:

```javascript
// Add to your animation.js file
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // Send email using EmailJS
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', data)
        .then(function(response) {
            alert('Message sent successfully!');
            document.getElementById('contactForm').reset();
        }, function(error) {
            alert('Failed to send message. Please try again.');
        });
});
```

## Option 5: Firebase Functions (Most Professional)

### Step 1: Set Up Firebase
1. Create Firebase project
2. Enable Cloud Functions
3. Set up Gmail API integration

### Step 2: Create Cloud Function
```javascript
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

exports.sendContactEmail = functions.https.onCall((data, context) => {
    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: 'your-email@codality.com',
            pass: 'your-app-password'
        }
    });
    
    const mailOptions = {
        from: 'your-email@codality.com',
        to: 'hello@codality.com',
        subject: 'New Contact Form Submission',
        html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Company:</strong> ${data.company}</p>
            <p><strong>Industry:</strong> ${data.industry}</p>
            <p><strong>Message:</strong> ${data.message}</p>
        `
    };
    
    return transporter.sendMail(mailOptions);
});
```

## Recommended Approach

**For immediate setup**: Use **Google Forms** (Option 1)
- No coding required
- Integrates perfectly with Google Workspace
- Free and reliable
- Easy to customize

**For professional setup**: Use **Formspree** (Option 2)
- Keeps your existing form design
- Free tier available
- Professional email delivery
- Easy to set up

## Setting Up Your Google Workspace Email

1. **Create the email**: In Google Workspace admin console, create `hello@codality.com`
2. **Set up forwarding**: Forward to your personal email if needed
3. **Configure auto-replies**: Set up automatic responses for form submissions

## Next Steps

1. Choose your preferred option
2. Set up the email `hello@codality.com` in Google Workspace
3. Test the form thoroughly
4. Set up email notifications
5. Consider adding a success page or modal

Would you like me to implement any of these options for you? 