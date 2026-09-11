# QueueEase WebApp

A responsive front-end prototype based on the uploaded queue-management references.

## Core flow
Home → Choose category → Search organization → View live queue → Select service → Join queue → Get digital token → Track position → Notification choice.

## Categories included
Hospital, College, Restaurant, Salon, Bike & Car Rental, Service Center, Bank, Government, Diagnostics.

## Run
Open `index.html` in a browser.

## Spring Boot integration
The Join Queue button attempts:
`POST http://localhost:8080/queue/take`

If your Spring Boot API is running and returns JSON with:
- tokenNumber
- queuePosition
- estimatedWaitingTime

the returned values are displayed.

If the backend is unavailable, the front end automatically uses demo data so you can still test the UI.

## Next development stages
1. Connect organizations/services to MySQL.
2. Add admin/business dashboard.
3. Add QR generation per organization/service.
4. Add real email/SMS/call integrations.
5. Add authentication and organization registration.
6. Add real location/maps.
