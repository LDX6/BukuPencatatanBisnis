import { ScannedProduct, Product } from '../types';
import { generateId } from '../store';

// Simulated product database for image recognition
const PRODUCT_PATTERNS = [
  { keywords: ['kopi', 'coffee', 'cappuccino', 'latte'], names: ['Kopi Hitam', 'Kopi Susu', 'Cappuccino', 'Latte'], basePrice: [8000, 12000, 18000, 20000] },
  { keywords: ['teh', 'tea', 'matcha'], names: ['Teh Manis', 'Teh Tawar', 'Matcha Latte', 'Thai Tea'], basePrice: [5000, 3000, 15000, 12000] },
  { keywords: ['jus', 'juice', 'sari'], names: ['Jus Jeruk', 'Jus Alpukat', 'Jus Mangga', 'Jus Stroberi'], basePrice: [10000, 15000, 12000, 13000] },
  { keywords: ['nasi', 'rice'], names: ['Nasi Goreng', 'Nasi Uduk', 'Nasi Kuning', 'Nasi Putih'], basePrice: [15000, 12000, 12000, 5000] },
  { keywords: ['mie', 'noodle', 'pasta'], names: ['Mie Goreng', 'Mie Ayam', 'Mie Rebus', 'Spaghetti'], basePrice: [13000, 15000, 12000, 20000] },
  { keywords: ['ayam', 'chicken'], names: ['Ayam Goreng', 'Ayam Bakar', 'Ayam Penyet', 'Nasi Ayam'], basePrice: [15000, 18000, 16000, 20000] },
  { keywords: ['roti', 'bread', 'bakery'], names: ['Roti Tawar', 'Roti Bakar', 'Croissant', 'Donat'], basePrice: [12000, 10000, 15000, 8000] },
  { keywords: ['snack', 'kue', 'cake'], names: ['Kue Lapis', 'Brownies', 'Cheesecake', 'Pudding'], basePrice: [10000, 15000, 25000, 8000] },
  { keywords: ['air', 'water', 'mineral'], names: ['Air Mineral 600ml', 'Air Mineral 1.5L', 'Air Galon'], basePrice: [4000, 7000, 15000] },
  { keywords: ['susu', 'milk'], names: ['Susu UHT', 'Susu Segar', 'Yogurt'], basePrice: [8000, 12000, 10000] },
];

export function analyzeImage(imageData: string, products: Product[]): Promise<ScannedProduct[]> {
  return new Promise((resolve) => {
    // Simulate AI processing time
    setTimeout(() => {
      const results: ScannedProduct[] = [];
      
      // Try to match with existing products first
      const matchedProducts = products.slice(0, Math.min(3, products.length));
      
      if (matchedProducts.length > 0) {
        // Match some existing products with high confidence
        const numMatches = Math.min(2, matchedProducts.length);
        for (let i = 0; i < numMatches; i++) {
          const product = matchedProducts[Math.floor(Math.random() * matchedProducts.length)];
          results.push({
            id: generateId(),
            name: product.name,
            confidence: 0.85 + Math.random() * 0.14,
            price: product.price,
            image: imageData,
            matchedProductId: product.id,
          });
        }
      }

      // Add some "detected" products from patterns
      const patternIdx = Math.floor(Math.random() * PRODUCT_PATTERNS.length);
      const pattern = PRODUCT_PATTERNS[patternIdx];
      const nameIdx = Math.floor(Math.random() * pattern.names.length);
      
      // Check if already matched
      const alreadyMatched = results.some(r => r.name === pattern.names[nameIdx]);
      if (!alreadyMatched) {
        results.push({
          id: generateId(),
          name: pattern.names[nameIdx],
          confidence: 0.6 + Math.random() * 0.3,
          price: pattern.basePrice[nameIdx],
          image: imageData,
          matchedProductId: undefined,
        });
      }

      // Sort by confidence
      results.sort((a, b) => b.confidence - a.confidence);
      resolve(results.slice(0, 5));
    }, 1500 + Math.random() * 1000);
  });
}

export function captureImageFromCamera(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        reject(new Error('No file selected'));
      }
    };
    
    input.click();
  });
}

export function uploadImage(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Compress image
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxSize = 400;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        reject(new Error('No file selected'));
      }
    };
    
    input.click();
  });
}
