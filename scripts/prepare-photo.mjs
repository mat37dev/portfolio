// Prépare public/profile.jpg depuis la photo validée (recadrage 3:4 sur le
// visage, 800×1066, qualité 82). Usage : node scripts/prepare-photo.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "docs/superpowers/mockups/photo.jpg");
const out = path.join(root, "public/profile.jpg");

const info = await sharp(src)
    .rotate()
    .resize(800, 1066, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);

console.log(`profile.jpg : ${info.width}×${info.height}, ${Math.round(info.size / 1024)} Ko`);
