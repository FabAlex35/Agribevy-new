/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
    images: {
        domains: ['localhost'],
      },
  //   images: {
  //   remotePatterns: [  
  //     {
  //       protocol: 'http',
  //       hostname: 'localhost',
  //       port: '3000', // The port your backend is running on
  //       pathname: '/uploads/**', // Path to the images
  //     },
  //   ],
  // },
};

    

export default nextConfig;
