import Image from 'next/image';
import Link from 'next/link';

const categories = [
  {
    id: 1,
    name: 'Electronics',
    image: 'https://images.pexels.com/photos/1841841/pexels-photo-1841841.jpeg',
    count: 320,
  },
  {
    id: 2,
    name: 'Fashion',
    image: 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg',
    count: 520,
  },
  {
    id: 3,
    name: 'Home & Kitchen',
    image: 'https://images.pexels.com/photos/1358900/pexels-photo-1358900.jpeg',
    count: 235,
  },
  {
    id: 4,
    name: 'Sports & Fitness',
    image: 'https://images.pexels.com/photos/2261482/pexels-photo-2261482.jpeg',
    count: 145,
  },
  {
    id: 5,
    name: 'Beauty',
    image: 'https://images.pexels.com/photos/3373739/pexels-photo-3373739.jpeg',
    count: 189,
  },
  {
    id: 6,
    name: 'Toys',
    image: 'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg',
    count: 92,
  },
];

export default function FeaturedCategories() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((category) => (
        <Link
          href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
          key={category.id}
          className="group"
        >
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="h-40 overflow-hidden">
              <Image
                src={category.image}
                alt={category.name}
                width={300}
                height={200}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4 bg-white text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-1">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.count} products</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}