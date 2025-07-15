import { Eta } from "https://deno.land/x/eta@v3.1.0/src/index.ts";
import * as scrypt from "https://deno.land/x/scrypt@v4.2.1/mod.ts";
import * as userService from "./userService.js";
import * as sessionService from "./sessionService.js";


const eta = new Eta({ views: `${Deno.cwd()}/templates/` });

const showRegistrationForm = (c) => c.html(eta.render("registration.eta"));

const registerUser = async (c) => {
  const body = await c.req.parseBody();
  if (body.password !== body.verification) {
    return c.text("The provided passwords did not match.");
  }

  const existingUser = await userService.findUserByUsername(body.username);
  if (existingUser) {
    return c.text(`A user with the username ${body.username} already exists.`);
  }

  const user = {
    id: crypto.randomUUID(),
    username: body.username,
    passwordHash: scrypt.hash(body.password),
  };

  await userService.createUser(user);
  await sessionService.createSession(c, user);
  return c.redirect("/");
};

const showLoginForm = (c) => c.html(eta.render("login.eta"));

const loginUser = async (c) => {
    const body = await c.req.parseBody();
  
    const user = await userService.findUserByUsername(body.username);
    if (!user) {
      return c.text(`No user with the username ${body.username} exists.`);
    }
  
    const passwordsMatch = scrypt.verify(body.password, user.passwordHash);
  
    if (!passwordsMatch) {
      return c.text(`Incorrect password.`);
    }
  
    await sessionService.createSession(c, user);
    
    return c.redirect("/");
};

const logoutUser = async (c) => {
    await sessionService.deleteSession(c);
    return c.redirect("/");
  };

export { registerUser, showRegistrationForm, showLoginForm, loginUser, logoutUser};