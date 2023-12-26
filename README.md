# ⚙️ Nitrogen: Beautiful admin panel for your Liquid instances.⚙️

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

> [!IMPORTANT]
> Before preparing for the installation, make sure the host of your nitrogen instance is present in your Liquid CORS settings (`cors.allowed-origins`). For instance, local host of Nitrogen after running the docker image would be http://localhost:2001.

#### Docker:
1. Run the following command
```
docker run -e LIQUID_HOST=https://your.liquid.instance -e LIQUID_CLIENT_ID=application_client -p 2001:80 --name nitrogen shrihariprakash/nitrogen:latest
```
2. Open https://localhost:2001 to see the admin panel.

#### Manual Build:
1. Create a .env file in project root with the following variables:

```properties
VITE_LIQUID_HOST=https://your.liquid.instance
VITE_LIQUID_CLIENT_ID=application_client
```

2. Run `npm install`.
3. Run `npm run build`.
4. Host the `dist` folder in a static server.
5. Add the host of your Nitrogen instance to Liquid CORS settings and Redirect URI of the client from step 1.
