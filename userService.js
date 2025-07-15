const createUser = async (user) => {
    const kv = await Deno.openKv();
    await kv.set(["users", user.username], user);
  };
  
  const findUserByUsername = async (username) => {
    const kv = await Deno.openKv();
    const user = await kv.get(["users", username]);
    return user?.value;
  };
  
  export { createUser, findUserByUsername };