# Dev Diary: Google Meet Scheduler 📝

## What This Project Does

Imagine you need to schedule a meeting with multiple people. Normally you'd:
1. Open Google Calendar
2. Create an event
3. Add attendees manually
4. Wait for Google Meet to generate a link
5. Send everything to everyone

What if you could do all of that in one place, with one click? That's what this app does.

## The Big Picture

I built an app that lets people schedule Google Meet meetings instantly. No jumping between tabs. No copying and pasting. Just fill out a quick form, hit create, and boom - everyone gets invited with the meeting link ready to go.

**Why does this matter?**
- Saves time for busy professionals
- Fewer missed meeting links
- Everything organized in one dashboard
- No confusion about which meeting is which

## How I Built It (Simple Version)

I used **Next.js** - which is basically a JavaScript framework that handles both the visible part (what you see) and the invisible part (the server logic) in one place.

For looks, I went with **Tailwind CSS** - think of it as pre-made design blocks that make everything look polished without spending hours on design.

**Google Calendar API** does the heavy lifting - when you create a meeting in my app, it actually talks to Google's servers to create the real calendar event and generate the Meet link.

**Supabase** keeps track of who's logged in and stores meeting information.

## The Journey: What Was Hard

### First Problem: Getting Login Right
Getting Google login to work properly was tricky. You can't just ask for permission once - you need special "offline access" so the app can create calendar events even when the user isn't looking. Took a few tries to get that right.

### Second Problem: Making Dates Work
Computers and dates don't speak the same language. Google Calendar wants dates in a specific format, and different time zones make it more confusing. Got there eventually though!

### Third Problem: Making It Look Good
Started with something basic. But then realized the UI needed personality. Went with a dark, professional look (black background, white text) so it feels premium and modern.

### Fourth Problem: Delete Safety
The scariest part - accidentally deleting a meeting. So instead of a scary pop-up that startles you, I built a nice confirmation screen that clearly shows what you're about to delete. Users hate surprises, so this mattered.

## What Works Now

✅ **Sign in with Google** - One click, no passwords to remember
✅ **Create meetings instantly** - Form fills out in seconds
✅ **Automatic Meet links** - No manual setup needed
✅ **Dashboard overview** - See all your meetings at a glance
✅ **Smart filtering** - Find upcoming meetings fast
✅ **Edit meetings** - Change details if plans shift
✅ **Delete safely** - Can't accidentally lose a meeting
✅ **Pagination** - Shows 3 meetings at a time so it's not overwhelming

## Key Insights (What I Learned)

1. **Details matter more than you think**
   - That nice delete confirmation? Users loved it way more than the ugly browser alert
   - Small animations and hover effects make the app feel alive

2. **Organization keeps things sane**
   - Instead of showing 50 meetings at once, showing just 3 with pagination? Way less overwhelming

3. **Users want efficiency**
   - They don't want to learn complicated workflows
   - They want one click, done

4. **Dark themes are professional**
   - The black and white design signals "this is a serious tool"

5. **React Lucide**: https://lucide.dev/guide/react/basics/color

6. **StackOverFlow**: https://stackoverflow.com/questions/22955719/google-oauth-2-0-offline-access


## Real-World Use Cases

**For busy executives:**
"I can schedule my team meeting while on a call with another client. Takes 30 seconds instead of 5 minutes."

**For recruiters:**
"No more manually copying Meet links into interview invites. It's all automated."

**For anyone scheduling anything:**
"My attendees get the link instantly. No follow-up emails needed."

## What I'd Add Next

- **Reminders** - "Hey, your meeting starts in 10 minutes"
- **Templates** - Save favorite meeting setups for quick reuse
- **Calendar view** - See meetings in a month view like Google Calendar
- **Meeting notes** - Jot down notes during the call, save them in the app

## The Bottom Line

This app exists to solve a real problem: scheduling meetings shouldn't be this hard. In a world where time is money, shaving off 5 minutes per meeting adds up fast. That's the whole idea.

Every feature, every design choice, every animation - it's all aimed at one thing: making scheduling meetings as frictionless as possible.

3. **Copy to Clipboard**
   - One-click meeting link copying
   - Visual feedback (toast notifications)
   - Button state change on success

4. **Enhanced UI/UX**
   - Modern black & white theme
   - Responsive grid layouts
   - Hover effects and transitions
   - Loading states and empty states
   - Status indicators (upcoming/completed)

## Resources & Documentation Used

1. **Google Calendar API**: https://developers.google.com/calendar/api/guides
   - Event creation with conferenceData
   - OAuth 2.0 scopes for calendar access

2. **Supabase Auth**: https://supabase.com/docs/guides/auth
   - Google OAuth provider setup
   - Session management

3. **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

4. **Tailwind CSS**: https://tailwindcss.com/docs
   - Dark mode utilities
   - Responsive design patterns

## Improvement Ideas Implemented

### ✅ Automatically Adding Attendees
- Form input for comma-separated emails
- Automatic calendar invitations sent to attendees
- Email validation before submission

### ✅ Listing Upcoming Meet Events
- Dashboard displays all scheduled meetings
- Sorted chronologically
- Separate upcoming/completed filters
- Real-time statistics

### ✅ Copying Meet Link to Clipboard
- One-click copy functionality
- Toast notification on success
- Visual button state feedback
- Direct link in meeting card details

## Additional Enhancements Made

1. **Professional Design System**
   - Consistent spacing and typography
   - Micro-interactions (hover states, transitions)
   - Accessibility considerations

2. **Error Handling**
   - Comprehensive try-catch blocks
   - User-friendly error messages
   - Loading state indicators

3. **Performance Optimizations**
   - Sorted meeting data on fetch
   - Memoized calculations for stats
   - Optimistic UI updates

4. **Security**
   - OAuth 2.0 for authentication
   - Protected API routes
   - No sensitive data in client state

## How to Use

### 1. Authentication
- Click "Get Started with Google" on landing page
- Complete Google OAuth flow
- Redirected to dashboard on success

### 2. Create Meeting
- Click "New Meeting" button
- Fill in required fields (title, start/end time)
- Optionally add attendees (comma-separated emails)
- Click "Create with Google Meet"
- Automatic Meet link generation + calendar invite

### 3. Manage Meetings
- View all meetings on dashboard
- Filter between upcoming and all meetings
- Copy meeting link with one click
- Join meeting directly from card
- View attendee list for each meeting

## Testing Recommendations

1. **Authentication Flow**
   - Test OAuth login/logout
   - Verify session persistence

2. **Meeting Creation**
   - Test with/without attendees
   - Verify Meet link generation
   - Check timezone handling
   - Test form validation

3. **Dashboard**
   - Verify meeting sorting
   - Test filter functionality
   - Check stat calculations
   - Test copy-to-clipboard

## Future Enhancements

1. **Recurring Meetings** - Support for repeating events
2. **Email Reminders** - Automatic reminders before meetings
3. **Meeting Notes** - In-app note-taking during meetings
4. **Timezone Selection** - User-defined timezone preferences
5. **Calendar Integration** - Direct calendar view embed
6. **Analytics** - Track meeting attendance and duration

## Deployment Notes

- Environment variables needed:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - Google Calendar API credentials (via Supabase)

- Database schema includes:
  - `meetings` table with meet_link column
  - `attendees` relationship
  - Timestamps for created_at, updated_at

## Conclusion

This implementation demonstrates a production-ready integration of Google Meet scheduling with a modern web stack. The focus on UX, error handling, and clean code makes it an excellent foundation for a real-world productivity tool.

The black & white theme provides a professional, distraction-free interface while the smooth interactions and comprehensive feature set ensure users have all tools needed for efficient meeting management.
