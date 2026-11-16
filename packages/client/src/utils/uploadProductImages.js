import { apiFetch } from "../api/config";
// Cache each completed upload so a retry does not upload it again.
export async function uploadProductImages(images, adminToken, cache, category) {
  const keys = [];
  for (const image of images) {
    if (image.key) { keys.push(image.key); continue; }
    if (cache.get(image.file)?.category === category) { keys.push(cache.get(image.file).key); continue; }
    const response = await apiFetch("/api/admin/uploads/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ contentType: image.file.type, category, size: image.file.size }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Could not prepare image upload");
    const upload = await fetch(data.uploadUrl, {
      method: "PUT", headers: { "Content-Type": image.file.type }, body: image.file,
    });
    if (!upload.ok) throw new Error(`Image upload failed (${upload.status})`);
    cache.set(image.file, { key: data.key, category });
    keys.push(data.key);
  }
  return keys;
}
