import { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.ggpht.com'
            },
            {
                protocol: 'https',
                hostname: '*.googleusercontent.com'
            }
        ]
    }
};

export default nextConfig;

