export const getDiscogsToken = async () => {
    try {
        const response = await fetch(
            `https://api.discogs.com/oauth/request_token`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": {
                        "OAuth oauth_consumer_key": "GjpWFksNLnUEGaQGndMxHRgnGJYkZRdL",
                        "oauth_nonce": "saint_random",
                        "oauth_signature": "aBHWFknEzcwvAusgtRWc&",
                        "oauth_signature_method": "PLAINTEXT",
                        "oauth_timestamp": Date.now().toString(),
                        "oauth_callback": "your_callback"
                    },
                    "User-Agent": "MusicDateBot"
                },
            }
        );
        const data = await response;
        return await response;
    } catch (error) {
        console.error("Error fetching APOD data:", error);
        return ''
    }
};