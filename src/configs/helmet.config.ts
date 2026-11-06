const contentSecurityPolicyConfig = {
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'images.com'],
        connectSrc: ["'self'", 'api.example.com'],
        fontSrc: ["'self'", 'fonts.com'],
        objectSrc: ["'none'"],
    },
};

const hstsConfig = {
    maxAge: 60 * 60 * 24 * 365,
    includeSubDomains: true,
    preload: true,
};

export { contentSecurityPolicyConfig, hstsConfig };
