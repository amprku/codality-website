# Contact Form Setup Instructions

## ✅ What I've Done

I've updated your contact form to work with **Formspree** - a service that handles form submissions and sends them to your email. The form now has:

- ✅ Professional loading states
- ✅ Success/error messages
- ✅ Form validation
- ✅ Beautiful animations

## 🚀 Setup Steps (5 minutes)

### Step 1: Create Formspree Account
1. Go to [formspree.io](https://formspree.io)
2. Click "Sign Up" (free)
3. Create account with your Google Workspace email

### Step 2: Create Your Form
1. In Formspree dashboard, click "New Form"
2. Name it "Codality Contact Form"
3. Copy the form ID (looks like: `xrgjabrg`)

### Step 3: Update the Code
1. Open `scripts/animation.js`
2. Find this line: `fetch('https://formspree.io/f/YOUR_FORM_ID', {`
3. Replace `YOUR_FORM_ID` with your actual form ID
4. Save the file

### Step 4: Set Up Your Email
1. In Google Workspace admin console, create `hello@codality.com`
2. In Formspree settings, set this as your notification email
3. Test the form!

## 📧 Email Setup in Google Workspace

### Option A: Create New Email
1. Go to [admin.google.com](https://admin.google.com)
2. Navigate to Users
3. Click "Add new user"
4. Create `hello@codality.com`
5. Set up forwarding to your personal email if needed

### Option B: Use Existing Email
1. In Formspree settings, use your existing Google Workspace email
2. Update the website to show your actual email address

## 🎯 Test Your Form

1. Deploy your website
2. Fill out the contact form
3. Check your email for the submission
4. Verify the success message appears

## 🔧 Customization Options

### Change Success Message
In `scripts/animation.js`, find:
```javascript
showFormMessage('Message sent successfully! We\'ll get back to you soon.', 'success');
```

### Change Error Message
Find:
```javascript
showFormMessage('Failed to send message. Please try again or email us directly.', 'error');
```

### Add Auto-Reply
In Formspree settings, you can set up automatic responses to form submissions.

## 📊 Formspree Free Tier Limits

- **50 submissions per month** (perfect for starting out)
- **Spam protection** included
- **Email notifications** included
- **Form analytics** included

## 🚨 Troubleshooting

### Form Not Sending
1. Check browser console for errors
2. Verify form ID is correct
3. Check Formspree dashboard for submissions

### No Email Received
1. Check spam folder
2. Verify email address in Formspree settings
3. Test with a different email address

### Success Message Not Showing
1. Check browser console for JavaScript errors
2. Verify form has the correct ID (`contactForm`)

## 🎉 You're Done!

Your contact form is now fully functional and will:
- ✅ Send emails to your Google Workspace account
- ✅ Show professional loading states
- ✅ Display success/error messages
- ✅ Protect against spam
- ✅ Work on all devices

## 📈 Next Steps

1. **Test thoroughly** on different devices
2. **Set up auto-replies** in Formspree
3. **Monitor submissions** in Formspree dashboard
4. **Consider upgrading** to paid plan if you exceed 50 submissions/month

---

**Need help?** The form is now ready to use - just follow the setup steps above! 