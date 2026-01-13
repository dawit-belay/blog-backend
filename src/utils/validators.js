// Input validation utilities

export const validators = {
  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 150;
  },

  // Password validation - minimum 8 chars, at least one uppercase, one number
  isValidPassword(password) {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false; // Has uppercase
    if (!/[0-9]/.test(password)) return false; // Has number
    return true;
  },

  // Name validation - 2-100 characters, letters and spaces
  isValidName(name) {
    if (!name || name.length < 2 || name.length > 100) return false;
    return /^[a-zA-Z\s'-]+$/.test(name);
  },

  // UUID validation
  isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  },

  // Title validation - 3-200 characters
  isValidTitle(title) {
    if (!title || typeof title !== 'string') return false;
    const trimmed = title.trim();
    return trimmed.length >= 3 && trimmed.length <= 200;
  },

  // Content validation - 10-5000 characters
  isValidContent(content) {
    if (!content || typeof content !== 'string') return false;
    const trimmed = content.trim();
    return trimmed.length >= 10 && trimmed.length <= 5000;
  },

  // URL validation for imageUrl
  isValidImageUrl(url) {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return url.length <= 1024;
    } catch {
      return false;
    }
  },

  // Status validation
  isValidStatus(status) {
    return ['active', 'suspended'].includes(status);
  },

  // Role validation
  isValidRole(role) {
    return ['user', 'creator', 'admin'].includes(role);
  },

  // Pagination validation
  isValidPagination(limit, offset) {
    const limitNum = parseInt(limit) || 10;
    const offsetNum = parseInt(offset) || 0;
    
    // Limit must be 1-100
    if (limitNum < 1 || limitNum > 100) return { valid: false, error: "Limit must be between 1 and 100" };
    
    // Offset must be >= 0
    if (offsetNum < 0) return { valid: false, error: "Offset must be >= 0" };
    
    return { valid: true, limit: limitNum, offset: offsetNum };
  }
};

// Validation middleware functions
export function validateSignup(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  if (!validators.isValidName(name)) {
    return res.status(400).json({ error: "Name must be 2-100 characters (letters, spaces, hyphens, apostrophes only)" });
  }

  if (!validators.isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!validators.isValidPassword(password)) {
    return res.status(400).json({ 
      error: "Password must be at least 8 characters with uppercase letter and number" 
    });
  }

  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (!validators.isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  next();
}

export function validateCreatePost(req, res, next) {
  const { title, content, imageUrl, userId, categoryId } = req.body;

  if (!title || !content || !userId || !categoryId) {
    return res.status(400).json({ 
      error: "Title, content, userId, and categoryId are required" 
    });
  }

  if (!validators.isValidTitle(title)) {
    return res.status(400).json({ error: "Title must be 3-200 characters" });
  }

  if (!validators.isValidContent(content)) {
    return res.status(400).json({ error: "Content must be 10-5000 characters" });
  }

  if (!validators.isValidImageUrl(imageUrl)) {
    return res.status(400).json({ error: "Invalid image URL" });
  }

  if (!validators.isValidUUID(userId)) {
    return res.status(400).json({ error: "Invalid userId format" });
  }

  if (!validators.isValidUUID(categoryId)) {
    return res.status(400).json({ error: "Invalid categoryId format" });
  }

  next();
}

export function validateUpdatePost(req, res, next) {
  const { title, content, imageUrl, status } = req.body;

  // All fields are optional for update, but if provided, must be valid
  if (title !== undefined && !validators.isValidTitle(title)) {
    return res.status(400).json({ error: "Title must be 3-200 characters" });
  }

  if (content !== undefined && !validators.isValidContent(content)) {
    return res.status(400).json({ error: "Content must be 10-5000 characters" });
  }

  if (imageUrl !== undefined && !validators.isValidImageUrl(imageUrl)) {
    return res.status(400).json({ error: "Invalid image URL" });
  }

  if (status !== undefined && !validators.isValidStatus(status)) {
    return res.status(400).json({ error: "Status must be 'active' or 'suspended'" });
  }

  next();
}

export function validateUpdateUser(req, res, next) {
  const { name, email, password, role, status } = req.body;

  if (name !== undefined && !validators.isValidName(name)) {
    return res.status(400).json({ error: "Name must be 2-100 characters" });
  }

  if (email !== undefined && !validators.isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (password !== undefined && !validators.isValidPassword(password)) {
    return res.status(400).json({ 
      error: "Password must be at least 8 characters with uppercase and number" 
    });
  }

  if (role !== undefined && !validators.isValidRole(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  if (status !== undefined && !validators.isValidStatus(status)) {
    return res.status(400).json({ error: "Status must be 'active' or 'suspended'" });
  }

  next();
}

export function validateBecomeCreator(req, res, next) {
  const { id } = req.params;

  if (!validators.isValidUUID(id)) {
    return res.status(400).json({ error: "Invalid user ID format" });
  }

  next();
}

export function validatePagination(req, res, next) {
  const { limit = 10, offset = 0 } = req.query;
  
  const validation = validators.isValidPagination(limit, offset);
  
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  // Attach validated pagination to request
  req.pagination = {
    limit: validation.limit,
    offset: validation.offset
  };

  next();
}
