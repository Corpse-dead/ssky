const calculateEstimatedPrice = (customSpecs, productType) => {
  const { size, quantity, material, finish } = customSpecs;
  
  // Base prices per product type (in INR)
  const basePrices = {
    sticker: 5,
    poster: 50,
    banner: 200,
    card: 10
  };
  
  // Material multipliers
  const materialMultipliers = {
    vinyl: 1.2,
    paper: 1.0,
    fabric: 1.5,
    transparent: 1.3,
    holographic: 2.0
  };
  
  // Finish multipliers
  const finishMultipliers = {
    matte: 1.0,
    glossy: 1.1,
    satin: 1.2
  };
  
  // Calculate area in square inches
  const area = size.width * size.height;
  
  // Base calculation
  let price = basePrices[productType] || basePrices.sticker;
  
  // Apply size factor (larger items cost more per unit area)
  if (area > 100) {
    price *= Math.sqrt(area / 100);
  }
  
  // Apply material and finish multipliers
  price *= (materialMultipliers[material] || 1.0);
  price *= (finishMultipliers[finish] || 1.0);
  
  // Quantity discounts
  let totalPrice = price * quantity;
  if (quantity >= 100) {
    totalPrice *= 0.8; // 20% discount for 100+
  } else if (quantity >= 50) {
    totalPrice *= 0.9; // 10% discount for 50+
  }
  
  // Minimum order value
  totalPrice = Math.max(totalPrice, 50);
  
  return Math.round(totalPrice);
};

module.exports = {
  calculateEstimatedPrice
};
