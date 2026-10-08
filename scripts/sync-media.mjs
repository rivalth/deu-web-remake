// Copies scraped images + unit logos into public/ and writes a manifest
// (width, height, blur placeholder) to src/generated/media.json.
// Runs before `dev` and `build`; outputs are gitignored.
import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const contentImages = path.join(root, "content/images");
const unitLogos = path.join(root, "brand/logos/units");
const publicDir = path.join(root, "public");
const manifestPath = path.join(root, "src/generated/media.json");

const RASTER = /\.(jpe?g|png|webp|gif)$/i;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function newer(src, dest) {
  if (!existsSync(dest)) return true;
  const [a, b] = await Promise.all([stat(src), stat(dest)]);
  return a.mtimeMs > b.mtimeMs;
}

const previous = existsSync(manifestPath)
  ? JSON.parse(await readFile(manifestPath, "utf8"))
  : { images: {}, units: {} };
const manifest = { images: {}, units: {} };
let copied = 0;

async function describe(file, url) {
  const cached = previous.images[url];
  if (cached && !(await newer(file, path.join(publicDir, url)))) return cached;
  const img = sharp(file);
  const { width, height } = await img.metadata();
  const blur = await img.clone().resize(12).webp({ quality: 40 }).toBuffer();
  return { width, height, blur: `data:image/webp;base64,${blur.toString("base64")}` };
}

// 1. content images
for await (const file of walk(contentImages)) {
  if (!RASTER.test(file)) continue;
  const rel = path.relative(contentImages, file).split(path.sep).join("/");
  const url = `/images/${rel}`;
  const dest = path.join(publicDir, url);
  const meta = await describe(file, url);
  if (await newer(file, dest)) {
    await mkdir(path.dirname(dest), { recursive: true });
    await copyFile(file, dest);
    copied++;
  }
  manifest.images[url] = meta;
}

// 2. unit logos: prefer a small PNG, fall back to SVG
const index = JSON.parse(await readFile(path.join(unitLogos, "index.json"), "utf8"));
for (const [group, units] of Object.entries(index)) {
  for (const [slug, files] of Object.entries(units)) {
    const png = files.find((f) => f.endsWith(".png"));
    const svg = files.find((f) => f.endsWith(".svg"));
    const pick = png ?? svg;
    if (!pick) continue;
    const src = path.join(unitLogos, group, slug, pick);
    const ext = pick.endsWith(".png") ? "webp" : "svg";
    const url = `/units/${slug}.${ext}`;
    const dest = path.join(publicDir, url);
    if (await newer(src, dest)) {
      await mkdir(path.dirname(dest), { recursive: true });
      if (ext === "webp") {
        await sharp(src).resize(160, 160, { fit: "inside" }).webp({ quality: 88 }).toFile(dest);
      } else {
        await copyFile(src, dest);
      }
      copied++;
    }
    manifest.units[slug] = { url, group };
  }
}

await mkdir(path.dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, JSON.stringify(manifest));
console.log(
  `media: ${Object.keys(manifest.images).length} images, ${Object.keys(manifest.units).length} unit logos (${copied} copied)`,
);
