// Cache each completed upload so a retry does not upload it again.
export async function uploadMobileImages(images, adminToken, cache) {
  const keys = [];
  for (const image of images) {
    if (image.key) { keys.push(image.key); continue; }
    if (cache.has(image.file)) { keys.push(cache.get(image.file)); continue; }
    const response = await fetch("http://localhost:5001/api/admin/uploads/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ contentType: image.file.type }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Could not prepare image upload");
    const upload = await fetch(data.uploadUrl, {
      method: "PUT", headers: { "Content-Type": image.file.type }, body: image.file,
    });
    if (!upload.ok) throw new Error(`Image upload failed (${upload.status})`);
    cache.set(image.file, data.key);
    keys.push(data.key);
  }
  return keys;
}
