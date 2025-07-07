const Joi = require('joi');

const productSchema = Joi.object({
  title: Joi.string().trim().max(100).required(),
  description: Joi.string().trim().max(500).required(),
  category: Joi.string().valid('gaming', 'tech', 'nature', 'vintage', 'abstract', 'custom').required(),
  productType: Joi.string().valid('poster', 'sticker', 'banner', 'card').required(),
  price: Joi.number().min(1).max(100000).required(),
  originalPrice: Joi.number().min(Joi.ref('price')).optional(),
  
  images: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      publicId: Joi.string().required(),
      alt: Joi.string().optional()
    })
  ).min(1).required(),
  
  specifications: Joi.object({
    size: Joi.string().required(),
    material: Joi.string().required(),
    finish: Joi.string().valid('matte', 'glossy', 'satin', 'vinyl').default('matte'),
    waterproof: Joi.boolean().default(true),
    customizable: Joi.boolean().default(true)
  }).required(),
  
  badge: Joi.string().valid('new', 'trending', 'bestseller', 'sale').optional(),
  isActive: Joi.boolean().default(true),
  featured: Joi.boolean().default(false),
  stock: Joi.number().min(0).default(999),
  
  seoMetadata: Joi.object({
    metaTitle: Joi.string().max(60).optional(),
    metaDescription: Joi.string().max(160).optional(),
    keywords: Joi.array().items(Joi.string()).optional()
  }).optional()
});

const productUpdateSchema = productSchema.fork(
  ['title', 'description', 'category', 'productType', 'price', 'images', 'specifications'],
  (schema) => schema.optional()
);

const validateProduct = (data) => {
  return productSchema.validate(data, { abortEarly: false });
};

const validateProductUpdate = (data) => {
  return productUpdateSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateProduct,
  validateProductUpdate
};
