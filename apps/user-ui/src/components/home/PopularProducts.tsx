import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, ShoppingCart } from 'lucide-react';

const popularProducts = [
  {
    id: 1,
    name: 'Apple iPhone 14 Pro',
    image: 'https://images.pexels.com/photos/5750001/pexels-photo-5750001.jpeg',
    price: 999,
    discountPrice: 899,
    rating: 4.8,
    sold: 320,
    category: 'Electronics',
  },
  {
    id: 2,
    name: 'Premium Blue Roses Box',
    image: 'https://images.pexels.com/photos/931162/pexels-photo-931162.jpeg',
    price: 89,
    discountPrice: 49,
    rating: 4.9,
    sold: 567,
    category: 'Gifts',
  },
  {
    id: 3,
    name: 'Smart Watch Series 7',
    image: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg',
    price: 399,
    discountPrice: 349,
    rating: 4.6,
    sold: 198,
    category: 'Electronics',
  },
  {
    id: 4,
    name: 'Leather Crossbody Bag',
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
    price: 129,
    discountPrice: 99,
    rating: 4.5,
    sold: 87,
    category: 'Fashion',
  },
  {
    id: 5,
    name: 'Wireless Gaming Mouse',
    image: 'https://images.pexels.com/photos/5082566/pexels-photo-5082566.jpeg',
    price: 79,
    discountPrice: 59,
    rating: 4.7,
    sold: 143,
    category: 'Electronics',
  },
  {
    id: 6,
    name: 'Men\'s Leather Wallet',
    image: 'https://images.pexels.com/photos/2442893/pexels-photo-2442893.jpeg',
    price: 49,
    discountPrice: 39,
    rating: 4.4,
    sold: 216,
    category: 'Accessories',
  },
  {
    id: 7,
    name: 'Fitness Activity Tracker',
    image: 'https://images.pexels.com/photos/4482890/pexels-photo-4482890.jpeg',
    price: 129,
    discountPrice: 99,
    rating: 4.5,
    sold: 98,
    category: 'Sports & Fitness',
  },
  {
    id: 8,
    name: 'Ceramic Coffee Mug Set',
    image: 'https://images.pexels.com/photos/1566308/pexels-photo-1566308.jpeg',
    price: 39,
    discountPrice: 29,
    rating: 4.3,
    sold: 76,
    category: 'Home & Kitchen',
  },
];

export default function PopularProducts() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {popularProducts.map((product) => (
        <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
          <div className="relative">
            <div className="h-60 overflow-hidden">
              <Image 
                src={product.image} 
                alt={product.name} 
                width={400} 
                height={300}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              <button className="w-9 h-9 rounded-full bg-white shadow hover:bg-gray-100 flex items-center justify-center transition-colors">
                <Heart size={18} className="text-gray-600" />
              </button>
              <button className="w-9 h-9 rounded-full bg-white shadow hover:bg-gray-100 flex items-center justify-center transition-colors">
                <Eye size={18} className="text-gray-600" />
              </button>
              <button className="w-9 h-9 rounded-full bg-white shadow hover:bg-gray-100 flex items-center justify-center transition-colors">
                <ShoppingCart size={18} className="text-gray-600" />
              </button>
            </div>
            {product.discountPrice < product.price && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
              </div>
            )}
          </div>
          <div className="p-4">
            <Link href={`/product/${product.id}`} className="block">
              <h3 className="text-gray-800 font-medium mb-1 hover:text-blue-500 transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="text-xs text-gray-500 mb-2">{product.category}</p>
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400'
                      : i < product.rating
                      ? 'text-yellow-300'
                      : 'text-gray-300'
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              ))}
              <span className="text-xs text-gray-500 ml-1">({product.sold})</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-gray-800">${product.discountPrice}</span>
                {product.discountPrice < product.price && (
                  <span className="text-sm text-gray-500 line-through ml-2">${product.price}</span>
                )}
              </div>
              <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                Add to cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}