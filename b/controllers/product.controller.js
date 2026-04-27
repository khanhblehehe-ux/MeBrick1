const db = require("../db");

function safeInt(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : d;
}

// GET /api/products
exports.getAll = async (req, res) => {
  try {
    const { section } = req.query;

    let query = db
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (section) {
      query = query.eq("section", section.toLowerCase());
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(data || []);
  } catch (err) {
    return res.status(500).json({ message: "Fetch products failed" });
  }
};

// ✅ GET /api/products/:id
exports.getById = async (req, res) => {
  try {
    const id = safeInt(req.params.id, 0);
    if (!id) return res.status(400).json({ message: "Invalid product id" });

    const { data, error } = await db
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      // Supabase/PostgREST: không tìm thấy thường là PGRST116
      if (String(error.code || "") === "PGRST116") {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(500).json({ message: error.message, details: error });
    }

    res.json(data);
  } catch (err) {
    return res.status(500).json({ message: "Fetch product failed", details: String(err?.message || err) });
  }
};

// POST /api/products
exports.create = async (req, res) => {
  try {
    const { name, price, image, section } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const payload = {
      name,
      price: Number(price) || 0,
      image: image || null,
      section: section?.toLowerCase() || "collection",
    };

    const { data, error } = await db
      .from("products")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(data);
  } catch (err) {
    return res.status(500).json({ message: "Create product failed" });
  }
};

// PUT /api/products/:id
exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const { name, price, image, section } = req.body || {};

    const updatePayload = {};

    if (name !== undefined) updatePayload.name = name;
    if (price !== undefined) updatePayload.price = Number(price) || 0;
    if (image !== undefined) updatePayload.image = image || null;
    if (section !== undefined)
      updatePayload.section = section.toLowerCase();

    const { error } = await db
      .from("products")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({ message: "Product updated" });
  } catch (err) {
    return res.status(500).json({ message: "Update failed" });
  }
};

// DELETE /api/products/:id
exports.remove = async (req, res) => {
  try {
    const id = safeInt(req.params.id, 0);
    if (!id) return res.status(400).json({ message: "Invalid product id" });

    const { error } = await db.from("products").delete().eq("id", id);

    if (error) {
      return res.status(500).json({ message: error.message, details: error });
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Delete product failed", details: String(err?.message || err) });
  }
};
