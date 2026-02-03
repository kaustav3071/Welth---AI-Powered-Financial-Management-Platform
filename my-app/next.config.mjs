/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        remotePatterns:[
            {
                protocol:'https',
                hostname:'randomuser.me',
            },
        ],
    },
    experimental:{
        serverActions:{
            bodySizeLimit:"5mb",
        },
    },
    // Enable detailed error messages in production for debugging
    productionBrowserSourceMaps: true,
};

export default nextConfig;
