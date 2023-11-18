import { serve } from "./deps.js";
import { configure, renderFile } from "./deps.js";
import * as messageService from "./services/messageService.js";

configure({
  views: `${Deno.cwd()}/views/`,
});

const responseDetails = {
  headers: { "Content-Type": "text/html;charset=UTF-8" },
};

const redirectTo = (path) => {
  return new Response(`Redirecting to ${path}.`, {
    status: 303,
    headers: {
      "Location": path,
    },
  });
};

const addMessage = async (request) => {
  const formData = await request.formData();

  const sender = formData.get("sender");
  const message = formData.get("message");

  await messageService.create(sender, message);

  return redirectTo("/");
};

const showHomepage = async (request) => {
  const data = {
    messages: await messageService.getLastMessages(),
  };

  return new Response(await renderFile("index.eta", data), responseDetails);
};

const handleRequest = async (request) => {
  const url = new URL(request.url);
  if (request.method === "POST" && url.pathname === "/") {
    return await addMessage(request);
  } else if (request.method === "GET") {
    return await showHomepage(request);
  } else {
    redirectTo("/");
  }
};

serve(handleRequest, { port: 7777 });
