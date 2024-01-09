// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

// adding thmes api 

app.get("/api/themes/all", async (_req, res) => {
  try{
    const themes  = await shopify.api.rest.Theme.all({
      session: res.locals.shopify.session,
    });
  
    //console.log(themes)
    res.status(200).send(themes); 

  }catch(err){
    console.log(err)
    res.status(500).send(err)
  }
  
});


// update theme 

app.get("/api/themes/:id", async (req, res) => {
  let status = 200;
  let error = null;

  try {
    console.log('params',req.params);
    const asset = await shopify.api.rest.Asset.all({
      session: res.locals.shopify.session,
      theme_id: req.params.id,
      asset: {"key": "layout/theme.liquid"},
    });
    res.status(status).send(asset);

  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
    res.status(status).send(e);
  }
  
});


//update a theme liquid

app.post("/api/themes/update/:id", async (req, res) => {
  let status = 200;
  let error = null;

  try {
    console.log('params',req.params);
    console.log('body',req.body);
    const asset = new shopify.api.rest.Asset({session: res.locals.shopify.session});
    asset.theme_id = Number(req.params.id);
    asset.key = "layout/theme.liquid";
    asset.value = req.body.value;
    await asset.save({
      update: true,
    });
    console.log('asset', asset);
    res.status(200).send(asset); 
    

  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
    res.status(200).send(e); 
  }


  
 
});


// get all script tag

app.get("/api/all/script_tags.json", async (req, res) => {
  let status = 200;
  let error = null;

  try {
    const asset = await shopify.api.rest.ScriptTag.all({
      session: res.locals.shopify.session,
    });
    console.log("", asset);
    res.status(status).send(asset);

  } catch (e) {
    console.log(`Failed to process Scripttag api: ${e.message}`);
    status = 500;
    error = e.message;
    res.status(status).send(e);
  }
  
});

//post a new script

app.post("/api/script/add/script_tags.json", async (req, res) => {
  let status = 200;
  let error = null;

  try {
    console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥script_taggggggggggggggggggggggggg',res.locals.shopify.session);
    const script_tag = new shopify.api.rest.ScriptTag({session: res.locals.shopify.session});
    script_tag.event = "onload";
    script_tag.src = "https://raw.githubusercontent.com/Sadiquzzaman/test/main/text.js";
    await script_tag.save({
    update: true,
  });
    res.status(200).send(script_tag); 
    

  } catch (e) {
    console.log(`Failed to add script tag: ${e.message}`);
    status = 500;
    error = e.message;
    res.status(200).send(e); 
  }
});



//


app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
