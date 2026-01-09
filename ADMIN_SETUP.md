# Admin User Creation Script

This script creates a new admin user or updates an existing user's role to admin.

## Usage

### Option 1: Using npm script (Recommended)

```bash
# Set environment variables and run the script
ADMIN_NAME="John Doe" ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="SecurePassword123!" npm run create-admin
```

### Option 2: Direct node execution

```bash
# Set environment variables and run the script directly
ADMIN_NAME="John Doe" ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="SecurePassword123!" node src/scripts/createAdmin.js
```

### Option 3: Using .env file

1. Add these variables to your `.env` file:
```
ADMIN_NAME=John Doe
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123!
```

2. Run the script:
```bash
npm run create-admin
```

## Behavior

- **If the user does NOT exist**: Creates a new user with the provided name, email, and password, and sets their role to `admin`
- **If the user ALREADY exists**: Updates their existing role to `admin` (password is not changed)

## Required Environment Variables

- `ADMIN_NAME` - Full name of the admin user
- `ADMIN_EMAIL` - Email address (unique)
- `ADMIN_PASSWORD` - Password for the admin user (will be hashed using bcrypt)

## Example Output

### Creating a new admin:
```
🔍 Checking for existing admin user with email: admin@example.com...
❌ No existing user found
➕ Creating new admin user...

✨ Admin user created successfully!
   ID: 550e8400-e29b-41d4-a716-446655440000
   Name: John Doe
   Email: admin@example.com
   Role: admin

✅ Operation completed successfully!
```

### Updating an existing user:
```
🔍 Checking for existing admin user with email: admin@example.com...
✅ User found with ID: 550e8400-e29b-41d4-a716-446655440000
📝 Updating role to 'admin'...

✨ Admin user updated successfully!
   ID: 550e8400-e29b-41d4-a716-446655440000
   Name: John Doe
   Email: admin@example.com
   Role: admin

✅ Operation completed successfully!
```

## Error Handling

If required environment variables are missing, the script will exit with an error:
```
❌ Error: Missing required environment variables. Please set: ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
```

## Docker Compose

If running in Docker:

```bash
docker-compose exec api npm run create-admin
```

Or with environment variables:

```bash
docker-compose exec -e ADMIN_NAME="John Doe" \
                   -e ADMIN_EMAIL="admin@example.com" \
                   -e ADMIN_PASSWORD="SecurePassword123!" \
                   api npm run create-admin
```

## Notes

- Passwords are hashed using bcrypt with 10 salt rounds before being stored
- If a user already exists, only their role is updated; their password remains unchanged
- Email addresses are unique in the database, so attempting to create a new user with an existing email will fail

