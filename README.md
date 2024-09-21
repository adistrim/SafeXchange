# SafeXchange - Secure File Sharing System

SafeXchange is a secure file-sharing platform designed to facilitate the uploading and downloading of files through encrypted URLs. It provides a seamless experience for both Ops Users and Client Users, ensuring that sensitive data is shared securely and efficiently.

## Features

### Ops User
- **Login**: Ops Users can log in using their credentials.
- **Upload File**: Only Ops Users can upload files of the following types: `.pptx`, `.docx`, `.xlsx`.
- **Download File**: Ops Users can download files using encrypted URLs.
- **Delete File**: Ops Users can delete uploaded files from the system.

### Client User
- **Sign Up**: Client Users can create an account.
- **Email Verification**: A verification email is sent to the registered address upon sign-up.
- **Verification**: Clients must use the link in the email to verify their account.
- **Login**: Client Users can log in with their credentials.
- **Dashboard Access**: Clients can access the list of files only after verifying their email.
- **Download File**: Client Users can download files using secure, encrypted URLs.
- **List Files**: Client Users can view all uploaded files.

## Tech Stack
- **Backend Framework**: FastAPI (Python)
- **Frontend Framework**: Next.js (JavaScript with App Router)
- **Database**: MongoDB (NoSQL)
- **File Storage**: AWS S3
- **CDN**: AWS CloudFront
- **Styling**: Tailwind CSS & Shadcn
- **Deployment**:
  - Backend: Self-hosted OVH server using Docker and Portainer for automation *<span style="color:orange">(Currently not available)</span>*
  - Frontend: Vercel
  - DNS Management: Cloudflare

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/adistrim/SafeXchange
   ```
2. Navigate to the project-server directory:
   ```bash
   cd SafeXchange/server
   ```
3. Setup virtual env and install dependencies for the backend:
   ```bash
   python3 -m venv .venv                # python3 or python depending on your system
   source .venv/bin/activate            # For macOS/Linux
   pip3 install -r requirements.txt     # pip3 or pip depending on your system
   ```
4. Install dependencies for the frontend:
   ```bash
   cd ../client
   npm install
   ```

## Setup Environment Variables
1. Create a `.env` file in the `server` directory:
   ```bash
   touch .env
   ```
2. Add the following environment variables to the `.env` file:
   ```bash
   MONGODB_URI=mongo_uri
   SECRET_KEY=secret_key
   EMAIL_FROM=email_address
   EMAIL_PASS=email_password
   SMTP_HOST=smtp_host
   EMAIL_SECURE=true
   EMAIL_PORT=email_port
   DOMAIN=domain
   ORIGIN_URL=origin_url
   AWS_ACCESS_KEY_ID=aws_access_key_id
   AWS_SECRET_ACCESS_KEY=aws_secret_access_key
   AWS_REGION=aws_region
   S3_BUCKET_NAME=s3_bucket_name
   CLOUDFRONT_DOMAIN=cloudfront_domain
   ```
   *Replace the placeholders with your actual values*

3. Create a `.env` file in the `client` directory:
   ```bash
   touch .env
   ```

4. Add the following environment variables to the `.env` file:
   ```bash
   NEXT_PUBLIC_API_URL=api_url
   ```
   *Replace the placeholder with your actual value*

## Usage
1. Start the backend server:
   ```bash
   cd server
   uvicorn app.main:app --reload
   ```
2. Start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```

## Docker
1. Build the Docker image for the backend:
   ```bash
   cd server
   docker build -t safexchange-server -f Docker/Dockerfile .
   ```
2. Run the Docker container:
   ```bash
   docker run --env-file .env -p 8000:8000 safexchange-server
   ```

## Known Issues
- Currently, there are no known significant issues. Please report any bugs or feature requests in the issue tracker.

## Getting Help
For questions or support mail me at [adistrim.dev@gmail.com](mailto:adistrim.dev@gmail.com), please file an issue in this repository's Issue Tracker.

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
