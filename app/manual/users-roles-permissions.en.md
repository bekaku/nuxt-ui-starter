The users and roles pages define who can sign in, and which menus each person sees.

## 1. Adding a new user

1. Go to the system users menu and press the add-new button
2. Fill in the name, email, and username (English letters, digits, dots, or underscores)
3. Assign user groups matching the role, e.g. administrator or staff
4. Save, then ask the user to set their own password

## 2. Creating groups and assigning permissions

1. Go to the user groups menu and add a new group
2. Name the group meaningfully, e.g. `content-editor`
3. Tick the permissions you need in the `<entity>_<action>` form, e.g. `app_user_list`
4. Save, then verify by signing in as a user in that group

## 3. Issuing an API client to another system

1. Go to the API client menu for developers
2. Create a new client linked to the user who owns the token
3. Copy the token to a safe place immediately; the system will not show it again
4. Disable or delete the token at once if you spot abnormal usage

## Cautions

- Web-side permissions only hide menus; the real authorization lives on the server
- Do not grant `delete` to general groups unless necessary
