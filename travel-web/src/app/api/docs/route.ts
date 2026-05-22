export function GET() {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Travel Group Organizer API</title>
    <style>
      body {
        margin: 0;
        color: #0f172a;
        background: #f8fafc;
        font-family: Arial, sans-serif;
        line-height: 1.55;
      }
      main {
        max-width: 920px;
        margin: 0 auto;
        padding: 32px 16px 56px;
      }
      h1, h2 {
        margin: 0 0 12px;
      }
      section {
        margin-top: 24px;
        padding: 18px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #ffffff;
      }
      code, pre {
        border-radius: 6px;
        background: #e2e8f0;
      }
      code {
        padding: 2px 5px;
      }
      pre {
        overflow-x: auto;
        padding: 12px;
      }
      .method {
        display: inline-block;
        min-width: 52px;
        font-weight: 700;
        color: #047857;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Travel Group Organizer REST API</h1>
      <p>Minimal mobile API for Expo clients. JSON endpoints return either data or <code>{ "error": "..." }</code>.</p>

      <section>
        <h2>Authentication</h2>
        <p><span class="method">POST</span> <code>/api/auth/login</code></p>
        <pre>{
  "email": "user@example.com",
  "password": "password"
}</pre>
        <p>Returns a JWT bearer token. Send it on protected routes:</p>
        <pre>Authorization: Bearer &lt;token&gt;</pre>

        <p><span class="method">POST</span> <code>/api/auth/register</code></p>
        <pre>{
  "name": "Ivan Dimitrov",
  "email": "ivan@example.com",
  "password": "pass123"
}</pre>
        <p>Creates a user and returns the same JWT bearer token response as login.</p>
      </section>

      <section>
        <h2>Documentation</h2>
        <p><span class="method">GET</span> <code>/api/docs</code></p>
        <p>Returns this API reference page.</p>
      </section>

      <section>
        <h2>Profile</h2>
        <p><span class="method">GET</span> <code>/api/profile</code></p>
        <p>Returns the authenticated user's profile.</p>

        <p><span class="method">PATCH</span> <code>/api/profile</code></p>
        <pre>{ "name": "Ivan Dimitrov" }</pre>
        <p>Updates the authenticated user's display name.</p>

        <p><span class="method">PATCH</span> <code>/api/profile/password</code></p>
        <pre>{
  "currentPassword": "old-password",
  "newPassword": "new-password",
  "confirmPassword": "new-password"
}</pre>
        <p>Changes the authenticated user's password after validating the current password.</p>
      </section>

      <section>
        <h2>Trips</h2>
        <p><span class="method">GET</span> <code>/api/trips?page=1&amp;pageSize=10</code></p>
        <p>Lists trips from the authenticated user's groups. <code>pageSize</code> is capped at 50.</p>

        <p><span class="method">GET</span> <code>/api/trips/{id}</code></p>
        <p>Returns one trip with capacity, joined state, the authenticated user's guest count, and all comments visible to group members.</p>
      </section>

      <section>
        <h2>Groups</h2>
        <p><span class="method">GET</span> <code>/api/groups</code></p>
        <p>Lists the authenticated user's travel groups with role, members count, and trips count.</p>
      </section>

      <section>
        <h2>Participation</h2>
        <p><span class="method">POST</span> <code>/api/trips/{id}/join</code></p>
        <pre>{ "guestsCount": 0 }</pre>
        <p>Joins the trip if not already joined. The body is optional and defaults to zero guests.</p>

        <p><span class="method">POST</span> <code>/api/trips/{id}/leave</code></p>
        <p>Leaves the trip if currently joined.</p>

        <p><span class="method">POST</span> <code>/api/trips/{id}/guests</code></p>
        <pre>{ "guestsCount": 2 }</pre>
        <p>Updates additional reserved guests. The user must already be joined.</p>

        <p><span class="method">GET</span> <code>/api/trips/{id}/preferences</code></p>
        <p>Returns the joined user's saved transport, accommodation, and note preferences.</p>

        <p><span class="method">POST</span> <code>/api/trips/{id}/preferences</code></p>
        <pre>{
  "transportPreference": "Shared car",
  "accommodationPreference": "Double room",
  "note": "Arriving after work"
}</pre>
        <p>Creates or updates trip preferences for the joined user. The API also accepts <code>TransportPreference</code>, <code>AccommodationPreference</code>, and <code>userNote</code> for compatibility.</p>
      </section>

      <section>
        <h2>Comments</h2>
        <p><span class="method">GET</span> <code>/api/trips/{id}/comment</code></p>
        <p>Lists comments for a trip in one of the authenticated user's groups.</p>

        <p><span class="method">POST</span> <code>/api/trips/{id}/comment</code></p>
        <pre>{ "content": "Looking forward to this trip!" }</pre>
        <p>Creates a comment for a trip in one of the authenticated user's groups.</p>

        <p><span class="method">PATCH</span> <code>/api/trips/{id}/comment/{commentId}</code></p>
        <pre>{ "content": "Updated comment text" }</pre>
        <p>Updates one of the authenticated user's own comments.</p>
      </section>
    </main>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
