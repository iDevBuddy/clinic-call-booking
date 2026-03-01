# 🏥 Clinic Call Booking System — Setup Guide

Complete setup guide to get your automated clinic call booking system running.

---

## Step 1: Set Up Airtable (Free)

### 1.1 Create Account
1. Go to [airtable.com](https://airtable.com) and sign up (free)
2. Create a new **Base** → name it `Clinic Bookings`

### 1.2 Create the Appointments Table
Create a table called **`Appointments`** with these exact columns:

| Column Name    | Field Type       | Notes                          |
|---------------|-----------------|--------------------------------|
| Patient Name  | Single line text | Primary field                  |
| Phone         | Phone number     | Patient contact                |
| Date          | Single line text | Format: YYYY-MM-DD            |
| Time          | Single line text | Format: HH:MM (24h)           |
| Reason        | Single line text | Reason for visit               |
| Status        | Single select    | Options: Confirmed, Cancelled  |
| Booked Via    | Single line text | Auto-filled: "Retell AI Call"  |
| Created At    | Single line text | Auto-filled ISO timestamp      |

### 1.3 Get Your API Credentials
1. Go to [airtable.com/create/tokens](https://airtable.com/create/tokens)
2. Click **"Create new token"**
3. Name: `Clinic Booking Bot`
4. **Scopes**: check `data.records:read` and `data.records:write`
5. **Access**: select your `Clinic Bookings` base
6. Click **Create token** → copy the token (starts with `pat...`)
7. Find your **Base ID**: go to [airtable.com/developers/web/api/introduction](https://airtable.com/developers/web/api/introduction), select your base → the URL contains your Base ID (starts with `app...`)

---

## Step 2: Deploy to Render.com (Free)

### 2.1 Push Code to GitHub
1. Create a new GitHub repository
2. Push this project code to it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/clinic-booking.git
   git push -u origin main
   ```

### 2.2 Deploy on Render
1. Go to [render.com](https://render.com) and sign up (free)
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Render will auto-detect the `render.yaml` config
5. Add your **Environment Variables**:
   - `RETELL_API_KEY` = your Retell API key
   - `AIRTABLE_API_KEY` = your Airtable token (pat...)
   - `AIRTABLE_BASE_ID` = your Base ID (app...)
6. Click **Create Web Service**
7. Wait for deploy → you'll get a URL like: `https://clinic-call-booking.onrender.com`

### 2.3 Keep Server Alive 24/7 (Free)
Render free tier sleeps after 15 min of inactivity. Fix this with UptimeRobot:

1. Go to [uptimerobot.com](https://uptimerobot.com) and sign up (free)
2. Click **Add New Monitor**
3. Settings:
   - Type: **HTTP(s)**
   - Friendly Name: `Clinic Booking Server`
   - URL: `https://clinic-call-booking.onrender.com/health`
   - Monitoring Interval: **5 minutes**
4. Click **Create Monitor**

Your server will now stay alive 24/7! ✅

---

## Step 3: Set Up Retell AI

### 3.1 Create Account
1. Go to [retellai.com](https://retellai.com) and sign up (free $10 credits)
2. Go to the Dashboard

### 3.2 Create an Agent
1. Click **Create Agent**
2. Configure the agent:
   - **Agent Name**: `Clinic Receptionist`
   - **Voice**: Choose a professional-sounding voice
   - **Language**: English (or your preferred language)
   - **Begin Message**: 
     ```
     Hello! Thank you for calling [Your Clinic Name]. I'm here to help you 
     schedule an appointment. May I have your name please?
     ```
   - **Prompt / System Instructions**:
     ```
     You are a friendly and professional receptionist for [Your Clinic Name].
     Your job is to help patients book appointments.
     
     Follow this conversation flow:
     1. Greet the caller and ask for their name
     2. Ask for the reason for their visit
     3. Ask what date they'd like to come in (understand natural language like "next Monday", "tomorrow", etc. and convert to YYYY-MM-DD format)
     4. Ask what time they prefer (convert to HH:MM 24-hour format)
     5. Use the check_availability function to verify the slot
     6. If available, confirm details and use book_appointment to book it
     7. If not available, suggest the next available slot
     8. Confirm the booking details at the end
     
     Important rules:
     - Always be polite and patient
     - Confirm all details before booking
     - The clinic is open from 9:00 AM to 5:00 PM
     - Appointment slots are 30 minutes each
     - If the caller asks about clinic information, provide general help
     ```

### 3.3 Add Custom Functions

#### Function 1: Check Availability
1. Click **Add Function** in your agent settings
2. Configure:
   - **Name**: `check_availability`
   - **Description**: `Check if a specific date and time slot is available for booking`
   - **URL**: `https://clinic-call-booking.onrender.com/retell/functions`
   - **Method**: POST
   - **Parameters**:
     ```json
     {
       "type": "object",
       "properties": {
         "date": {
           "type": "string",
           "description": "The date to check in YYYY-MM-DD format"
         },
         "time": {
           "type": "string",
           "description": "The time to check in HH:MM 24-hour format (optional)"
         }
       },
       "required": ["date"]
     }
     ```

#### Function 2: Book Appointment
1. Click **Add Function**
2. Configure:
   - **Name**: `book_appointment`
   - **Description**: `Book an appointment for a patient`
   - **URL**: `https://clinic-call-booking.onrender.com/retell/functions`
   - **Method**: POST
   - **Parameters**:
     ```json
     {
       "type": "object",
       "properties": {
         "patient_name": {
           "type": "string",
           "description": "Full name of the patient"
         },
         "phone": {
           "type": "string",
           "description": "Patient phone number"
         },
         "date": {
           "type": "string",
           "description": "Appointment date in YYYY-MM-DD format"
         },
         "time": {
           "type": "string",
           "description": "Appointment time in HH:MM 24-hour format"
         },
         "reason": {
           "type": "string",
           "description": "Reason for the appointment"
         }
       },
       "required": ["patient_name", "date", "time"]
     }
     ```

### 3.4 Add Webhook (Optional — for call logging)
1. In agent settings, go to **Webhooks**
2. Set URL: `https://clinic-call-booking.onrender.com/retell/webhook`
3. Enable events: `call_started`, `call_ended`, `call_analyzed`

### 3.5 Set Up Phone Number
1. In the Retell dashboard, go to **Phone Numbers**
2. Buy or connect a phone number
3. Assign your `Clinic Receptionist` agent to this number
4. Now when patients call this number, the AI receptionist answers!

---

## Step 4: Test Everything

### Test 1: Server Health
Open your browser and go to:
```
https://clinic-call-booking.onrender.com/health
```
You should see: `{"status":"ok"}`

### Test 2: Check Availability (via API)
```
https://clinic-call-booking.onrender.com/api/availability?date=2025-03-01
```
Should show available time slots.

### Test 3: Make a Test Call
1. In the Retell dashboard, use the **Test Call** feature
2. Talk to the AI agent and try to book an appointment
3. Check your Airtable base — the appointment should appear!

---

## 🎉 You're Done!

Your system is now:
- ✅ **Retell AI** handles all incoming calls with an AI receptionist
- ✅ **Airtable** stores all appointments (viewable, editable, shareable)
- ✅ **Render.com** hosts the server permanently for free
- ✅ **UptimeRobot** keeps the server alive 24/7

### Costs Summary
| Service     | Cost        |
|-------------|-------------|
| Render.com  | Free        |
| Airtable    | Free (up to 1,000 appointments) |
| UptimeRobot | Free        |
| Retell AI   | $10 free credits, then ~$0.07/min |
