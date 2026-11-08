import { useEffect, useState } from "react";
import { Alert, Button, Stack, Typography } from "@mui/material";

export default function MobileImagePicker({ images, onChange, disabled = false }) {
  const [error, setError] = useState("");
  const [previews, setPreviews] = useState([]);
  useEffect(() => {
    const urls = images.map((image) => image.file ? URL.createObjectURL(image.file) : image.url);
    setPreviews(urls);
    return () => images.forEach((image, index) => { if (image.file) URL.revokeObjectURL(urls[index]); });
  }, [images]);
  return (
    <Stack spacing={1}>
      <Typography variant="body2">Up to 4 images. The first image is the main product image.</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Button component="label" variant="outlined" disabled={disabled || images.length >= 4}>
        Add images
        <input hidden type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={disabled || images.length >= 4} onChange={(event) => {
          const files = Array.from(event.target.files || []);
          event.target.value = "";
          if (files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
            setError("Choose JPEG, PNG, or WebP images."); return;
          }
          if (images.length + files.length > 4) { setError("Choose at most 4 images in total."); return; }
          setError("");
          onChange([...images, ...files.map((file) => ({ file }))]);
        }} />
      </Button>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {images.map((image, index) => (
          <Stack key={image.key || `${image.file?.name}-${index}`} spacing={0.5} sx={{ width: 130 }}>
            <img src={previews[index]} alt={`Product image ${index + 1}`} style={{ width: 130, height: 110, objectFit: "contain" }} />
            <Typography variant="caption">{index === 0 ? "Main image" : `Image ${index + 1}`}</Typography>
            {index > 0 && <Button size="small" disabled={disabled} onClick={() => onChange([image, ...images.filter((_, i) => i !== index)])}>Make main</Button>}
            <Button size="small" color="error" disabled={disabled} onClick={() => onChange(images.filter((_, i) => i !== index))}>Remove</Button>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
