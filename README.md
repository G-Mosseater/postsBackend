# postsBackend

This project is a Node + Express backend for a blog-style application, featuring user authentication, post creation, and file uploads
It demonstrates key concepts I practiced:

-- Built full **REST APIs** for user authentication and post management (CRUD)

- **MongoDB & Mongoose**: Schema design for `User` and `Post`, referencing posts in users, querying with pagination
- **Authentication & Authorization**: Signup/login with hashed passwords (`bcrypt`) and JWT token-based authentication (`jsonwebtoken`), middleware to protect routes
- **File Uploads**: Handling images with `multer` and managing file storage
- **Input Validation**: Using `express-validator` to validate incoming requests
- **Error Handling**: Returning proper HTTP status codes and messages for validation, authorization, and server errors
