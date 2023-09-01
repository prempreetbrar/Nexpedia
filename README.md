# Nexpedia

A "nature-based" clone of Expedia. Works correctly ONLY on larger screen sizes. **Click [*here*](https://nexpedia.prempreetbrar.me) to 
try it out!** Or, watch a quick gif of me interacting with it below:
&nbsp;

## Features (Languages/Technologies Used: JavaScript, Node.js, Express, MongoDB, Mongoose, Pug.js)

- Uses a REST API with an MVC backend architecture that supports filtering, sorting, projecting, paginating, and uses aggregation, virtual properties, population, and Mongoose's document, query, and aggregation middleware
- Has **INCREDIBLY** strong error handling with a generic "catch all" error handler that reduces code duplication and distinguishes between operational vs programming errors, and modifies the error message based on development vs production environments
- Deals with unhandled rejections, exceptions, and Heroku SIGTERM signals
- Supports creation of new users by storing encrypted passwords in database; allows user to change password and reset it if it is forgotten via Brevo email handling
- PROPER authentication with JWT (token must be valid, not expired, the user's password has not changed, and the user is not inactive) and authorization
- Uses Mailtrap in the development environment, allowing you to send countless emails without worry
- Secure: Uses rate limiting, cookies, HTTP headers, body size limiting, NoSQL injection and XSS data sanitization and has protection against parameter pollution
- A proper data model with referencing/normalization on 1:MANY/1:TON data that has frequent updates and separate queries, and embedding/denormalization on 1:FEW data that has few updates and is generally queried together. Decisions were not made randomly. Parent referencing used to ensure we don't exceed MongoDB's 16 MB document size limit, with virtual population used to ensure we can still get all children linked to parent
- Factory functions reduce code duplication in controllers and views
- Calculations on data (such as ratings average), preventing duplicate reviews from the same user
- Geospatial queries using Mapbox to allow a user to see all the stops on a tour; geospatial aggregation to allow user to see all tours within a certain radius
- Indexing on frequently used filters to improve database performance
- Server-side rendering with Pug.js, with blocks used to reduce code duplication and HTML data sets used to transfer data. An error page is shown whenever there is ANY error, so the user is never left surprised as to what is happening. Frequent alerts are shown to give feedback when an operation is successful.
- Custom image uploading using Multer and Sharp, with image urls stored in the database; the actual image is kept on a file system to avoid exceeding MongoDB's document file size limit.
- Stripe payments to book a tour; webhook endpoints are used to register booking with user
- Deployment on Heroku, including a custom subdomain, HTTPs redirection, and automated certificate management for TLS
- Performance: Uses npm compression to compress body sizes, permits CORS (Cross-Origin Resource Sharing) for simple and non-simple requests
&nbsp;

## Limitations/Design Choices

- Pug.js is not the best tool for dealing with scalable frontend pages; if I were to do this again, I would choose to use React.js instead
- TypeScript was not used; I wanted to focus mainly on Node.js, Express, Mongoose, and MongoDB, without having to worry about type errors or styles (especially for code that I was writing temporarily or experimenting with). However, in the future, I would use TypeScript, as it would have saved me a bit of developer time by catching errors that I had to otherwise find myself.
- I did not implement all API endpoints on the frontend; this was mainly due to time. I hope to come back in the future and implement more of them.
- The Stripe purchase page is only for testing; I do not receive actual payments. This was because the main purpose of this was to learn, not to make money.
&nbsp;

### If you want to start up the project on your local machine:

You can't! Here are the following CONFIG/ENV variables that you would need:
- DATABASE_URL
- DATABASE_PASSWORD
- JWT_SECRET
- BREVO_USERNAME
- BREVO_PASSWORD
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

Leaving this information in the repo would pose a security risk. Please do feel free to browse the website and make an account/login with an existing account however! Also feel free to make "test" payments on the Stripe checkout page. Simply enter a credit card of 4242 4242 4242 4242.
  
