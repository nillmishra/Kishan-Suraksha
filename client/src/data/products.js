// client/src/data/products.js
import p1 from '../assets/1h.webp';
import p2 from '../assets/2.jpg';
import p3 from '../assets/3.webp';
import p4 from '../assets/4.webp';
import p6 from '../assets/new.webp';
import p7 from '../assets/7.webp';
import p8 from '../assets/8.jpg';
import p9 from '../assets/9.webp';

// Removed one item (id: 5, "No Virus Bio Viricide") as requested.
// Update or remove whichever you prefer easily here.

export const products = [
  { id: 1, name: 'Saaf Fungicide', price: 99,  rating: 3.5, image: p1 },
  { id: 2, name: 'Coragen Insecticide', price: 155, rating: 4.5, image: p2 },
  { id: 3, name: 'Lancergold Insecticide', price: 349, rating: 4.0, image: p3 },
  { id: 4, name: 'Carina Insecticide', price: 505, rating: 3.5, image: p4 },
  // { id: 5, name: 'No Virus Bio Viricide', price: 285, rating: 3.5, image: p5 }, // removed
  { id: 6, name: 'Keefun Insecticide', price: 666, rating: 3.5, image: p6 },
  { id: 7, name: 'Roundup Herbicide', price: 299, rating: 3.5, image: p7 },
  { id: 8, name: 'Biovita Liquid BioFertilizer', price: 222, rating: 2.5, image: p8 },
  { id: 9, name: 'Nominee Gold Herbicide', price: 90,  rating: 3.5, image: p9 },
];