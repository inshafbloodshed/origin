function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    
    let videoId = null;
    
    if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        videoId = urlParams.get('v');
    }
    else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
    }
    else if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('shorts/')[1]?.split('?')[0];
    }
    
    if (videoId) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0&showinfo=0&controls=1&fs=1&iv_load_policy=3&enablejsapi=1&origin=${frontendUrl}`;
    }
    
    return url;
}

module.exports = { getYouTubeEmbedUrl };