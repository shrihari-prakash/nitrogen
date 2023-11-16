# ⚙️ Nitrogen: Beautiful admin panel for your Liquid instances.⚙️

> NOTE: This project is still under active development. Expect little bugs and issues until this becomes stable.

![Nitrogen Admin Panel](images/banner.png)

### What is Liquid?

Liquid is a Docker-based open-source authentication server that supercharges your product development by offering out of the box APIs for features like follow-unfollow, blocking, and banning so that you can focus on just your application logic. 🚀

Read more about the Liquid project [here](https://github.com/shrihari-prakash/liquid).

### ⭐ Nitrogen features:

- **Effortless Integration with Liquid:** Simply build the project with your Liquid hostname and client ID and you are all good to go!
- **User Info Editor:** Quick and intuitive user info editing.
- **Admin Controls:** Verify, Ban or restrict users right from your Nitrogen instance.
- **Permissions Editor:** Nitrogen offers an intuitive permissions editor for granting precise access to Liquid instance administrators.
- **Highly Responsive:** Nitrogen was designed with mobile first approach making user management possible from anywhere!

### 🔧 Installation:

1. Create a .env file in project root with the following variables:

```bash
VITE_LIQUID_HOST=https://your.liquid.instance
VITE_LIQUID_CLIENT_ID=application_client
```

2. Run `npm run build`.
3. Host the `dist` folder in a static server.
4. Add the host of your Nitrogen instance to Liquid CORS settings and Redirect URI of the client from step 1.
