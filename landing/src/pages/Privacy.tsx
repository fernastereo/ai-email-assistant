import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/" className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground">
          ← Back to replie.email
        </Link>

        <h1 className="mb-2 text-4xl font-bold">Privacy Policy</h1>
        <p className="mb-10 text-sm text-muted-foreground">Last updated: May 3, 2026</p>

        <div className="space-y-8 text-muted-foreground">

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">1. Overview</h2>
            <p>
              Replie ("we", "our", or "us") is a Chrome Extension that helps you write better emails using AI.
              This Privacy Policy explains what data we access, how we use it, and what we do not do with it.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">2. Data We Access</h2>
            <p className="mb-3">When you use Replie to generate a reply or summarize an email, the extension reads the text content of the email currently open in your browser. Specifically:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>The visible text of the email body</li>
              <li>The sender's display name (used to personalize the greeting in generated replies)</li>
            </ul>
            <p className="mt-3">We do <strong className="text-foreground">not</strong> access your Gmail account credentials, your contacts, your inbox list, or any email other than the one you explicitly interact with.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">3. How We Use Your Data</h2>
            <p className="mb-3">The email text you interact with is sent to our backend server solely to generate a reply, summary, or sentiment analysis using an AI language model. Specifically:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Email content is transmitted securely over HTTPS to our API at <span className="font-mono text-sm">api.replie.email</span></li>
              <li>We process the content through an AI provider (Groq, OpenAI, or DeepSeek depending on configuration)</li>
              <li>The generated response is returned to your browser and inserted into your compose box</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">4. Data Retention</h2>
            <p>
              We do <strong className="text-foreground">not</strong> store, log, or retain the content of any email you process with Replie.
              Email text is processed in memory and discarded immediately after the AI response is generated.
              We do not build profiles, train models, or share your email content with any third party beyond the AI provider needed to generate the response.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">5. Data Stored Locally</h2>
            <p className="mb-3">The extension stores the following data locally in your browser using <span className="font-mono text-sm">chrome.storage.local</span>:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Your preferred tone and reply length settings</li>
              <li>Your daily usage count (resets every 24 hours)</li>
            </ul>
            <p className="mt-3">This data never leaves your device and is not transmitted to our servers.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">6. Third-Party AI Providers</h2>
            <p>
              To generate replies and summaries, email content is sent to one of the following AI providers depending on our current configuration:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li><a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">OpenAI Privacy Policy</a></li>
              <li><a href="https://groq.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Groq Privacy Policy</a></li>
              <li><a href="https://www.deepseek.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">DeepSeek Privacy Policy</a></li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">7. Waitlist & Payment Data</h2>
            <p>
              If you sign up for the Replie waitlist at replie.email, we collect your name and email address, stored in Firebase Firestore.
              If you complete a payment, your PayPal transaction ID is stored alongside your waitlist entry.
              This data is used only to manage early access and is never sold or shared with third parties.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">8. Permissions</h2>
            <p className="mb-3">Replie requests the following Chrome permissions and uses them as described:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li><strong className="text-foreground">activeTab / scripting:</strong> Read the email content from the active Gmail tab when you click a Replie button</li>
              <li><strong className="text-foreground">storage:</strong> Save your tone and usage settings locally</li>
              <li><strong className="text-foreground">tabs:</strong> Detect when you are on a Gmail page to activate the toolbar</li>
              <li><strong className="text-foreground">contextMenus:</strong> Add a right-click option to analyze selected text</li>
              <li><strong className="text-foreground">notifications:</strong> Show optional desktop notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">9. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:support@replie.email" className="underline hover:text-foreground">
                support@replie.email
              </a>
              .
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Privacy;
