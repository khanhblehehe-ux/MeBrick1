const db = require("../db"); // supabase client

// Bucket dùng cho ảnh sản phẩm + preview (bucket phải Public)
const BUCKET = process.env.SUPABASE_PRODUCTS_BUCKET || "products";
// Folder cho preview
const PREVIEW_FOLDER = process.env.SUPABASE_PREVIEW_FOLDER || "previews";

function getExtFromMime(mime) {
  if (!mime) return "bin";
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return "bin";
}

function parseDataUrlImage(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return null;

  // data:image/png;base64,xxxx
  const m = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!m) return null;

  const mimeType = m[1];
  const base64 = m[2];

  try {
    const buffer = Buffer.from(base64, "base64");
    return { mimeType, buffer };
  } catch {
    return null;
  }
}

/**
 * POST /api/uploads/product-image
 * form-data: file
 * return: { url, path }
 */
exports.uploadProductImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Missing file" });

    const { buffer, mimetype, originalname } = req.file;

    // basic validate (chỉ cho ảnh)
    if (!String(mimetype || "").startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }

    const ext = getExtFromMime(mimetype);
    const safeName = String(originalname || "image")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    const filePath = `products/${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}-${safeName}.${ext}`;

    // Upload lên Storage
    const { error: upErr } = await db.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: mimetype,
        upsert: true,
        cacheControl: "3600",
      });

    if (upErr) {
      return res.status(500).json({ message: upErr.message });
    }

    // Lấy public URL (bucket phải Public)
    const { data } = db.storage.from(BUCKET).getPublicUrl(filePath);

    return res.json({ url: data.publicUrl, path: filePath });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Upload failed" });
  }
};

/**
 * POST /api/uploads/base64
 * body: { dataUrl: "data:image/png;base64,..." }
 * return: { url, path }
 *
 * Dùng để upload preview từ FE (html-to-image/toDataURL)
 */
exports.uploadBase64Preview = async (req, res) => {
  try {
    const { dataUrl } = req.body || {};
    const parsed = parseDataUrlImage(dataUrl);

    if (!parsed) {
      return res.status(400).json({ message: "Invalid dataUrl" });
    }

    const { mimeType, buffer } = parsed;

    if (!String(mimeType || "").startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }

    // chặn file quá lớn (tuỳ chọn)
    const maxBytes = Number(
      process.env.UPLOAD_PREVIEW_MAX_BYTES || 6 * 1024 * 1024,
    ); // 6MB
    if (buffer.length > maxBytes) {
      return res.status(413).json({ message: "Preview image too large" });
    }

    const ext = getExtFromMime(mimeType);
    const filePath = `${PREVIEW_FOLDER}/${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}.preview.${ext}`;

    const { error: upErr } = await db.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
        cacheControl: "3600",
      });

    if (upErr) {
      return res.status(500).json({ message: upErr.message });
    }

    const { data } = db.storage.from(BUCKET).getPublicUrl(filePath);
    return res.json({ url: data.publicUrl, path: filePath });
  } catch (err) {
    console.error("uploadBase64Preview error:", err);
    return res.status(500).json({ message: "Upload preview failed" });
  }
};

/**
 * POST /api/uploads/customer-image
 * form-data: file, customerName (optional)
 * return: { url, path, id }
 */
exports.uploadCustomerImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Missing file" });

    const { buffer, mimetype, originalname } = req.file;
    const { customerName = "Guest" } = req.body || {};

    if (!String(mimetype || "").startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }

    const ext = getExtFromMime(mimetype);
    const safeName = String(originalname || "image")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    const filePath = `customer-designs/${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}-${safeName}.${ext}`;

    const { error: upErr } = await db.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: mimetype,
        upsert: true,
        cacheControl: "3600",
      });

    if (upErr) {
      return res.status(500).json({ message: upErr.message });
    }

    const { data } = db.storage.from(BUCKET).getPublicUrl(filePath);

    // Lưu thông tin vào database (nếu có bảng customer_images)
    const { error: dbErr, data: inserted } = await db
      .from("customer_images")
      .insert({
        customer_name: customerName,
        url: data.publicUrl,
        path: filePath,
        created_at: new Date().toISOString(),
      })
      .select("id, customer_name, url, created_at");

    if (dbErr) {
      console.error("DB insert error:", dbErr);
      // Vẫn return url được upload, nhưng không lưu DB
      return res.json({
        url: data.publicUrl,
        path: filePath,
        message: "Uploaded but DB save failed",
      });
    }

    return res.json({
      url: data.publicUrl,
      path: filePath,
      id: inserted?.[0]?.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Upload failed" });
  }
};

/**
 * GET /api/uploads/customer-images
 * return: [ { id, customer_name, url, created_at }, ... ]
 */
exports.getCustomerImages = async (req, res) => {
  try {
    const { data, error } = await db
      .from("customer_images")
      .select("id, customer_name, url, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.json(data || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Fetch failed" });
  }
};

/**
 * POST /api/uploads/customer-image-public
 * Public endpoint – không cần auth.
 * form-data: file
 * return: { url, path, id }
 */
exports.uploadCustomerImagePublic = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Missing file" });

    const { buffer, mimetype, originalname } = req.file;

    if (!String(mimetype || "").startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }

    const ext = getExtFromMime(mimetype);
    const safeName = String(originalname || "image")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    const filePath = `customer-designs/${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}-${safeName}.${ext}`;

    const { error: upErr } = await db.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: mimetype,
        upsert: true,
        cacheControl: "3600",
      });

    if (upErr) {
      return res.status(500).json({ message: upErr.message });
    }

    const { data } = db.storage.from(BUCKET).getPublicUrl(filePath);

    const { error: dbErr, data: inserted } = await db
      .from("customer_images")
      .insert({
        customer_name: "Customer",
        url: data.publicUrl,
        path: filePath,
        created_at: new Date().toISOString(),
      })
      .select("id, url");

    if (dbErr) {
      console.error("DB insert error:", dbErr);
      return res.json({ url: data.publicUrl, path: filePath });
    }

    return res.json({
      url: data.publicUrl,
      path: filePath,
      id: inserted?.[0]?.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Upload failed" });
  }
};

/**
 * DELETE /api/uploads/customer-images/:id
 */
exports.deleteCustomerImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy path trước khi xoá
    const { data: img, error: selectErr } = await db
      .from("customer_images")
      .select("path")
      .eq("id", id)
      .single();

    if (selectErr) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Xoá file từ storage
    if (img?.path) {
      const { error: delErr } = await db.storage
        .from(BUCKET)
        .remove([img.path]);
      if (delErr) console.error("Storage delete error:", delErr);
    }

    // Xoá từ database
    const { error: dbErr } = await db
      .from("customer_images")
      .delete()
      .eq("id", id);

    if (dbErr) {
      return res.status(500).json({ message: dbErr.message });
    }

    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Delete failed" });
  }
};
