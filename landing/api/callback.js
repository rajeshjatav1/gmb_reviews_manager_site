/**
 * Vercel Serverless Function — OAuth Callback
 *
 * Google redirects here after user grants permission.
 * We extract the auth code + the WordPress site URL from `state`,
 * then redirect back to the user's WordPress site with the code.
 *
 * Registered redirect URI in Google Cloud Console:
 *   https://your-vercel-site.vercel.app/api/callback
 */
export default function handler(req, res) {
    const { code, state, error, error_description } = req.query;

    // If Google returned an error
    if (error) {
        const msg = encodeURIComponent(error_description || error || 'OAuth error');
        // If we have a state (site URL), redirect back with error
        if (state) {
            try {
                const siteUrl = decodeURIComponent(state);
                return res.redirect(302, `${siteUrl}/wp-admin/admin.php?page=gmb-ai&gmb_auth=failed&gmb_err=${msg}`);
            } catch (e) {}
        }
        return res.status(400).send(`OAuth Error: ${error_description || error}`);
    }

    // Validate we have both code and state
    if (!code || !state) {
        return res.status(400).send('Missing code or state parameter.');
    }

    // Decode the WordPress site URL from state
    let siteUrl;
    try {
        siteUrl = decodeURIComponent(state);
        // Basic URL validation
        new URL(siteUrl);
    } catch (e) {
        return res.status(400).send('Invalid state parameter.');
    }

    // Redirect back to the user's WordPress site with the auth code
    const redirectUrl = `${siteUrl}/wp-admin/admin.php?page=gmb-ai&gmb_code=${encodeURIComponent(code)}`;
    return res.redirect(302, redirectUrl);
}
