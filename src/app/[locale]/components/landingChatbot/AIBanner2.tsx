import Image from 'next/image';

const AIBanner2: React.FC = () => {
  return (
    <div className="relative h-screen flex items-center justify-center text-center text-white">
      <Image
        src="/banner2.png"
        alt="Background Image"
        fill
        quality={100}
        className="z-0"
        style={{ objectFit: 'cover' }}  // Moved objectFit to the style prop
      />
      <div className="relative z-10">
        <h1 className="text-6xl font-bold mb-4">Project Astra</h1>
        <p className="text-lg mb-8">
          A research prototype exploring future capabilities of a universal AI assistant
        </p>
        <button className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
          Learn more
        </button>
      </div>
    </div>
  );
};

export default AIBanner2;