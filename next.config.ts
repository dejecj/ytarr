import { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'yt3.ggpht.com'
            }
        ]
    }
};

export default nextConfig;

