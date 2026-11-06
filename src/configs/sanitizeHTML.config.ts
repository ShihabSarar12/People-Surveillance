const sanitizeHTMLConfig = {
    allowedTags: ['b', 'i', 'em', 'strong', 'a'],
    allowedAttributes: {
        a: ['href'],
    },
    allowedIframeHostnames: ['www.youtube.com'],
};

export default sanitizeHTMLConfig;
