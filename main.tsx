import { Application, Router, Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";

const app = new Application();
const router = new Router();

router
  .get("/", (ctx: Context) => {
    ctx.response.body = `<!DOCTYPE html><html><head><title>Home</title><link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/tailwind.min.css" rel="stylesheet"></head><body><div id="root"></div><script type="module" src="/static/client.js"></script></body></html>`;
  })
  .get("/settings", (ctx: Context) => {
    ctx.response.body = `<!DOCTYPE html><html><head><title>Settings</title><link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/tailwind.min.css" rel="stylesheet"></head><body><div id="root"></div><script type="module" src="/static/client.js"></script></body></html>`;
  })
  .get("/about", (ctx: Context) => {
    ctx.response.body = `<!DOCTYPE html><html><head><title>About</title><link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/tailwind.min.css" rel="stylesheet"></head><body><div id="root"></div><script type="module" src="/static/client.js"></script></body></html>`;
  });

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Deno server running on http://localhost:8000");
await app.listen({ port: 8000 });